import json
import logging
from urllib.parse import urlparse

from bs4 import BeautifulSoup
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import Backlink, BacklinkAnalysis, Lead, LeadStatus
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile
from marketing_api.posthog_client import capture_feature_usage
from marketing_api.settings import settings
from marketing_api.utils.ssrf import fetch_validated_html, validate_external_url

router = APIRouter(prefix="/public/backlink", tags=["backlink"])
logger = logging.getLogger(__name__)


class BacklinkAnalysisRequest(BaseModel):
    url: HttpUrl
    email: EmailStr | None = None
    turnstile_token: str | None = None


async def analyze_backlinks(url: str) -> dict:
    """
    Analyze backlinks for a given URL.
    This is a basic implementation that can be extended with API integration.
    """
    try:
        # Fetch the target page
        html, status_code = await fetch_validated_html(url, user_agent="Carolina Growth Backlink Analyzer")
        soup = BeautifulSoup(html, "lxml")

        # Extract basic backlink information
        # Note: This is a simplified analysis. Real implementation would use
        # Ahrefs/Moz API or more sophisticated scraping
        links = soup.find_all("a", href=True)
        
        backlinks = []
        referring_domains = set()
        
        for link in links[:50]:  # Limit to first 50 for demo
            href = link.get("href", "")
            if not href:
                continue
            
            # Resolve relative URLs
            if href.startswith("/"):
                full_url = f"{urlparse(str(url)).scheme}://{urlparse(str(url)).netloc}{href}"
            elif href.startswith("http"):
                full_url = href
            else:
                continue
            
            # Extract domain
            try:
                domain = urlparse(full_url).netloc
                referring_domains.add(domain)
            except Exception:
                continue
            
            anchor_text = link.get_text(strip=True) or ""
            link_type = "dofollow" if link.get("rel") != "nofollow" else "nofollow"
            
            backlinks.append({
                "source_url": full_url,
                "target_url": str(url),
                "anchor_text": anchor_text[:500],
                "link_type": link_type,
                "domain_authority": None,  # Would come from API
            })

        # Calculate quality score (simplified)
        quality_score = min(100, max(0, len(referring_domains) * 2 + len(backlinks)))

        return {
            "total_backlinks": len(backlinks),
            "referring_domains": len(referring_domains),
            "quality_score": quality_score,
            "backlinks": backlinks[:20],  # Return top 20
            "top_domains": list(referring_domains)[:10],
        }
    except Exception as e:
        logger.error("Error analyzing backlinks: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze backlinks"
        )


@router.post("/analyze")
@limiter.limit("10/minute")
async def analyze_backlink(
    request: Request,
    body: BacklinkAnalysisRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
):
    """Analyze backlinks for a given URL."""
    # Turnstile verification
    should_bypass = await should_bypass_turnstile(request, body.turnstile_token)
    if not should_bypass:
        from marketing_api.routes.public import verify_turnstile
        await verify_turnstile(body.turnstile_token)

    # Validate URL
    try:
        validate_external_url(str(body.url))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Perform analysis
    try:
        analysis_data = await analyze_backlinks(str(body.url))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Backlink analysis failed: %s", e)
        raise HTTPException(status_code=500, detail="Analysis failed")

    # Save to database
    analysis = BacklinkAnalysis(
        url=str(body.url),
        email=body.email,
        status="completed",
        analysis_json=json.dumps(analysis_data),
        quality_score=analysis_data.get("quality_score"),
        total_backlinks=analysis_data.get("total_backlinks"),
        referring_domains=analysis_data.get("referring_domains"),
    )
    session.add(analysis)
    await session.flush()

    # Save individual backlinks
    for bl_data in analysis_data.get("backlinks", []):
        backlink = Backlink(
            analysis_id=analysis.id,
            source_url=bl_data["source_url"],
            target_url=bl_data["target_url"],
            anchor_text=bl_data.get("anchor_text"),
            link_type=bl_data.get("link_type"),
            domain_authority=bl_data.get("domain_authority"),
        )
        session.add(backlink)

    await session.commit()

    # Capture lead if email provided
    if body.email:
        from marketing_api.routes.public import upsert_lead
        await upsert_lead(
            session,
            full_name=body.email.split("@")[0],
            email=body.email,
            company=None,
            details=f"Backlink analysis requested for {body.url}\nQuality Score: {analysis_data.get('quality_score', 0)}/100",
            source="backlink_analyzer",
        )
        
        # Send email notification
        background_tasks.add_task(
            send_email,
            to_address=body.email,
            subject="Your Backlink Analysis Report",
            body=f"""
Thank you for using our Backlink Analyzer!

Your analysis for {body.url} is complete.

Quality Score: {analysis_data.get('quality_score', 0)}/100
Total Backlinks Found: {analysis_data.get('total_backlinks', 0)}
Referring Domains: {analysis_data.get('referring_domains', 0)}

View the full report at: {settings.app_url}/backlink-analyzer

Best regards,
Carolina Growth Team
            """,
        )

    # Track feature usage
    capture_feature_usage("backlink_analyzer_used", {"url": str(body.url)})

    return {
        "url": str(body.url),
        "quality_score": analysis_data.get("quality_score"),
        "total_backlinks": analysis_data.get("total_backlinks"),
        "referring_domains": analysis_data.get("referring_domains"),
        "backlinks": analysis_data.get("backlinks", []),
        "top_domains": analysis_data.get("top_domains", []),
    }
