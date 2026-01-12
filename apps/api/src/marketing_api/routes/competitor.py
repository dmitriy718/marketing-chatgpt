import json
from typing import List

from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

import httpx

from marketing_api.db.models import CompetitorComparison
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile
from marketing_api.routes.seo import analyze_seo
from marketing_api.posthog_client import capture_feature_usage

async def fetch_url(url: str) -> tuple[str, int]:
    """Fetch URL and return HTML content and status code."""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(str(url), headers={"User-Agent": "Carolina Growth Competitor Analyzer"})
            return response.text, response.status_code
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to fetch URL.")

router = APIRouter(prefix="/public/competitor", tags=["competitor"])


class CompetitorComparisonRequest(BaseModel):
    user_url: HttpUrl
    competitor_urls: List[HttpUrl]  # Up to 3 competitors
    email: EmailStr | None = None
    turnstile_token: str | None = None


async def compare_websites(user_url: str, competitor_urls: List[str]) -> dict:
    """Compare user website against competitors."""
    if len(competitor_urls) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 competitors allowed")

    # Analyze user website
    try:
        user_html, user_status = await fetch_url(user_url)
        if user_status != 200:
            raise HTTPException(status_code=400, detail=f"User URL returned status {user_status}")
        user_analysis = analyze_seo(user_html, user_url)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to analyze user website: {str(exc)}") from exc

    # Analyze competitors
    competitor_analyses = []
    for comp_url in competitor_urls:
        try:
            comp_html, comp_status = await fetch_url(comp_url)
            if comp_status == 200:
                comp_analysis = analyze_seo(comp_html, comp_url)
                competitor_analyses.append({
                    "url": comp_url,
                    "score": comp_analysis["score"],
                    "summary": comp_analysis["summary"],
                })
        except Exception:
            # Skip failed competitors but continue
            competitor_analyses.append({
                "url": comp_url,
                "score": None,
                "error": "Failed to analyze",
            })

    # Calculate comparison metrics
    user_score = user_analysis["score"]
    competitor_scores = [c["score"] for c in competitor_analyses if c.get("score") is not None]
    avg_competitor_score = sum(competitor_scores) / len(competitor_scores) if competitor_scores else user_score
    max_competitor_score = max(competitor_scores) if competitor_scores else user_score

    # Find gaps
    gaps = []
    if user_score < avg_competitor_score:
        gaps.append({
            "metric": "Overall SEO Score",
            "your_score": user_score,
            "competitor_avg": round(avg_competitor_score, 1),
            "gap": round(avg_competitor_score - user_score, 1),
            "urgency": "high" if (avg_competitor_score - user_score) > 20 else "medium",
        })

    # Compare specific metrics
    user_summary = user_analysis["summary"]
    for comp in competitor_analyses:
        if comp.get("summary"):
            comp_summary = comp["summary"]
            # Compare images with alt text
            user_alt_ratio = (
                (user_summary["total_images"] - user_summary["images_without_alt"]) / user_summary["total_images"]
                if user_summary["total_images"] > 0
                else 0
            )
            comp_alt_ratio = (
                (comp_summary["total_images"] - comp_summary["images_without_alt"]) / comp_summary["total_images"]
                if comp_summary["total_images"] > 0
                else 0
            )
            if comp_alt_ratio > user_alt_ratio + 0.1:
                gaps.append({
                    "metric": "Image Alt Text Coverage",
                    "your_score": round(user_alt_ratio * 100, 1),
                    "competitor_score": round(comp_alt_ratio * 100, 1),
                    "competitor_url": comp["url"],
                    "urgency": "medium",
                })

            # Compare internal links
            if comp_summary["internal_links"] > user_summary["internal_links"] + 2:
                gaps.append({
                    "metric": "Internal Links",
                    "your_count": user_summary["internal_links"],
                    "competitor_count": comp_summary["internal_links"],
                    "competitor_url": comp["url"],
                    "urgency": "medium",
                })

            # Compare structured data
            if comp_summary["has_structured_data"] and not user_summary["has_structured_data"]:
                gaps.append({
                    "metric": "Structured Data",
                    "your_status": "Missing",
                    "competitor_status": "Present",
                    "competitor_url": comp["url"],
                    "urgency": "high",
                })

    return {
        "user": {
            "url": user_url,
            "score": user_score,
            "summary": user_summary,
        },
        "competitors": competitor_analyses,
        "comparison": {
            "your_score": user_score,
            "avg_competitor_score": round(avg_competitor_score, 1),
            "max_competitor_score": max_competitor_score,
            "rank": "Below Average" if user_score < avg_competitor_score else "Above Average",
            "gaps": gaps,
            "recommendation": (
                "Your website is significantly behind competitors. Immediate action recommended."
                if user_score < avg_competitor_score - 15
                else "Your website is competitive but has room for improvement."
                if user_score < avg_competitor_score
                else "Your website is performing well compared to competitors."
            ),
        },
    }


@router.post("/compare", status_code=status.HTTP_200_OK)
@limiter.limit("2/hour")
async def compare_competitors(
    request: Request,
    payload: CompetitorComparisonRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Compare user website against competitors."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)

    if len(payload.competitor_urls) == 0:
        raise HTTPException(status_code=400, detail="At least one competitor URL required")

    user_url_str = str(payload.user_url)
    competitor_urls_str = [str(url) for url in payload.competitor_urls]

    try:
        comparison = await compare_websites(user_url_str, competitor_urls_str)

        # Store in database
        comp_record = CompetitorComparison(
            user_url=user_url_str,
            email=payload.email,
            comparison_json=json.dumps(comparison),
        )
        session.add(comp_record)
        await session.commit()

        # If email provided, capture as lead and send report
        if payload.email:
            from marketing_api.routes.public import upsert_lead
            await upsert_lead(
                session,
                full_name=payload.email.split("@")[0],
                email=payload.email,
                company=None,
                details=f"Competitor comparison requested\nYour site: {user_url_str}\nScore: {comparison['comparison']['your_score']}/100\nRank: {comparison['comparison']['rank']}",
                source="competitor-comparison",
            )

            # Send email with comparison
            report_body = f"""
Competitor Comparison Report

Your Website: {user_url_str}
Your SEO Score: {comparison['comparison']['your_score']}/100
Average Competitor Score: {comparison['comparison']['avg_competitor_score']}/100
Rank: {comparison['comparison']['rank']}

{comparison['comparison']['recommendation']}

Key Gaps Identified:
"""
            for gap in comparison["comparison"]["gaps"][:5]:  # Top 5 gaps
                report_body += f"\n- {gap['metric']}: {gap.get('gap', 'See details in full report')}\n"

            report_body += "\n\nGet a free consultation to close these gaps and beat your competitors.\nBook a call: https://carolinagrowth.co/contact"

            send_email(
                to_address=payload.email,
                subject=f"Competitor Comparison: You're {'Behind' if comparison['comparison']['your_score'] < comparison['comparison']['avg_competitor_score'] else 'Ahead'}",
                body=report_body,
            )

            notify_admin(
                subject="New competitor comparison request",
                body=f"Email: {payload.email}\nUser site: {user_url_str}\nScore: {comparison['comparison']['your_score']}/100",
                reply_to=payload.email,
            )

        return comparison
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(exc)}") from exc
