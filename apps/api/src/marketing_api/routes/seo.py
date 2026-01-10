import json
from urllib.parse import urlparse, urljoin

from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, HttpUrl
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

import httpx

from marketing_api.db.models import Lead, LeadStatus, SeoAudit
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile
from marketing_api.settings import settings

router = APIRouter(prefix="/public/seo", tags=["seo"])


class SeoAuditRequest(BaseModel):
    url: HttpUrl
    email: EmailStr | None = None
    turnstile_token: str | None = None


async def fetch_url(url: str) -> tuple[str, int]:
    """Fetch URL and return HTML content and status code."""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(str(url), headers={"User-Agent": "Carolina Growth SEO Auditor"})
            return response.text, response.status_code
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to fetch URL.")


def analyze_seo(html: str, url: str) -> dict:
    """Analyze HTML for SEO issues and return findings."""
    soup = BeautifulSoup(html, "lxml")
    findings = []
    score = 100

    # Check title tag
    title = soup.find("title")
    if not title or not title.string or len(title.string.strip()) < 30:
        findings.append({"type": "error", "category": "title", "message": "Missing or too short title tag (recommended: 30-60 characters)"})
        score -= 15
    elif len(title.string.strip()) > 60:
        findings.append({"type": "warning", "category": "title", "message": "Title tag is too long (recommended: 30-60 characters)"})
        score -= 5
    else:
        findings.append({"type": "success", "category": "title", "message": "Title tag is well-optimized"})

    # Check meta description
    meta_desc = soup.find("meta", attrs={"name": "description"})
    if not meta_desc or not meta_desc.get("content") or len(meta_desc.get("content", "").strip()) < 120):
        findings.append({"type": "error", "category": "meta", "message": "Missing or too short meta description (recommended: 120-160 characters)"})
        score -= 10
    elif len(meta_desc.get("content", "")) > 160:
        findings.append({"type": "warning", "category": "meta", "message": "Meta description is too long (recommended: 120-160 characters)"})
        score -= 5
    else:
        findings.append({"type": "success", "category": "meta", "message": "Meta description is well-optimized"})

    # Check H1 tag
    h1_tags = soup.find_all("h1")
    if len(h1_tags) == 0:
        findings.append({"type": "error", "category": "headings", "message": "Missing H1 tag"})
        score -= 10
    elif len(h1_tags) > 1:
        findings.append({"type": "warning", "category": "headings", "message": f"Multiple H1 tags found ({len(h1_tags)}), should be only one"})
        score -= 5
    else:
        findings.append({"type": "success", "category": "headings", "message": "H1 tag is present and unique"})

    # Check images without alt text
    images = soup.find_all("img")
    images_without_alt = [img for img in images if not img.get("alt")]
    if images_without_alt:
        findings.append({"type": "warning", "category": "images", "message": f"{len(images_without_alt)} image(s) missing alt text"})
        score -= min(10, len(images_without_alt) * 2)

    # Check for internal links
    links = soup.find_all("a", href=True)
    internal_links = 0
    for link in links:
        href = link.get("href", "")
        if href.startswith("/") or urlparse(str(url)).netloc in href:
            internal_links += 1
    if internal_links < 3:
        findings.append({"type": "warning", "category": "links", "message": "Few internal links found (recommended: 3+)"})
        score -= 5

    # Check for structured data
    scripts = soup.find_all("script", type="application/ld+json")
    if not scripts:
        findings.append({"type": "info", "category": "structured", "message": "No structured data (JSON-LD) found - consider adding schema markup"})
        score -= 5

    # Check mobile viewport
    viewport = soup.find("meta", attrs={"name": "viewport"})
    if not viewport:
        findings.append({"type": "error", "category": "mobile", "message": "Missing viewport meta tag for mobile responsiveness"})
        score -= 10

    # Check page size (rough estimate)
    html_size = len(html)
    if html_size > 3 * 1024 * 1024:  # 3MB
        findings.append({"type": "warning", "category": "performance", "message": "Page size is large, may affect load time"})
        score -= 5

    score = max(0, score)
    return {"score": score, "findings": findings, "summary": {
        "total_images": len(images),
        "images_without_alt": len(images_without_alt),
        "total_links": len(links),
        "internal_links": internal_links,
        "has_structured_data": len(scripts) > 0,
    }}


@router.post("/audit", status_code=status.HTTP_200_OK)
@limiter.limit("3/hour")
async def audit_website(
    request: Request,
    payload: SeoAuditRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Audit a website for SEO issues."""
    from marketing_api.routes.public import verify_turnstile
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)

    url_str = str(payload.url)

    # Check for cached result (same URL, last 30 days)
    existing = await session.execute(
        select(SeoAudit)
        .where(SeoAudit.url == url_str)
        .order_by(SeoAudit.created_at.desc())
        .limit(1)
    )
    cached = existing.scalar_one_or_none()
    if cached and cached.findings_json:
        # Return cached if less than 30 days old
        from datetime import datetime, timedelta, timezone
        if cached.created_at and (datetime.now(timezone.utc) - cached.created_at) < timedelta(days=30):
            return {
                "url": url_str,
                "score": cached.score,
                "findings": json.loads(cached.findings_json) if cached.findings_json else [],
                "cached": True,
            }

    # Fetch and analyze
    try:
        html, status_code = await fetch_url(url_str)
        if status_code != 200:
            raise HTTPException(status_code=400, detail=f"URL returned status {status_code}")

        analysis = analyze_seo(html, url_str)

        # Store in database
        audit = SeoAudit(
            url=url_str,
            email=payload.email,
            score=analysis["score"],
            findings_json=json.dumps(analysis["findings"]),
        )
        session.add(audit)
        await session.commit()

        # If email provided, capture as lead and send report
        if payload.email:
            from marketing_api.routes.public import upsert_lead
            await upsert_lead(
                session,
                full_name=payload.email.split("@")[0],
                email=payload.email,
                company=None,
                details=f"SEO Audit requested for {url_str}\nScore: {analysis['score']}/100",
                source="seo-audit",
            )

            # Send email with report
            report_body = f"""
SEO Audit Report for {url_str}

Overall Score: {analysis['score']}/100

Findings:
"""
            for finding in analysis["findings"]:
                report_body += f"\n[{finding['type'].upper()}] {finding['category']}: {finding['message']}\n"

            report_body += f"""

Summary:
- Total Images: {analysis['summary']['total_images']}
- Images Missing Alt Text: {analysis['summary']['images_without_alt']}
- Total Links: {analysis['summary']['total_links']}
- Internal Links: {analysis['summary']['internal_links']}
- Has Structured Data: {analysis['summary']['has_structured_data']}

For a comprehensive SEO strategy, contact Carolina Growth.
"""

            await send_email(
                to_address=payload.email,
                subject=f"SEO Audit Report for {urlparse(url_str).netloc}",
                body=report_body,
            )

            await notify_admin(
                subject="New SEO audit request",
                body=f"Email: {payload.email}\nURL: {url_str}\nScore: {analysis['score']}/100",
                reply_to=payload.email,
            )

        return {
            "url": url_str,
            "score": analysis["score"],
            "findings": analysis["findings"],
            "summary": analysis["summary"],
            "cached": False,
        }
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(exc)}") from exc
