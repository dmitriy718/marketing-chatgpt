import json
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr, HttpUrl
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile, upsert_lead
from marketing_api.routes.seo import analyze_seo, fetch_url
from marketing_api.posthog_client import capture_feature_usage

router = APIRouter(prefix="/public/intelligence", tags=["intelligence"])


class IntelligenceReportRequest(BaseModel):
    url: HttpUrl
    email: EmailStr
    turnstile_token: str | None = None


async def generate_intelligence_report(url: str) -> dict:
    """Generate competitive intelligence report."""
    try:
        html, status_code = await fetch_url(url)
        if status_code != 200:
            raise HTTPException(status_code=400, detail=f"URL returned status {status_code}")
        
        analysis = analyze_seo(html, url)
        
        # Enhanced analysis for intelligence report
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, "lxml")
        
        # Check for social media links
        social_links = []
        for link in soup.find_all("a", href=True):
            href = link.get("href", "").lower()
            if any(platform in href for platform in ["facebook", "twitter", "linkedin", "instagram", "youtube"]):
                social_links.append(href)
        
        # Check for contact information
        contact_info = {
            "has_phone": bool(soup.find(string=lambda text: text and "phone" in text.lower())),
            "has_email": bool(soup.find(string=lambda text: text and "@" in text)),
            "has_address": bool(soup.find(string=lambda text: text and any(word in text.lower() for word in ["street", "avenue", "road", "address"]))),
        }
        
        # Check for trust signals
        trust_signals = {
            "has_testimonials": bool(soup.find(string=lambda text: text and any(word in text.lower() for word in ["testimonial", "review", "client"]))),
            "has_certifications": bool(soup.find(string=lambda text: text and any(word in text.lower() for word in ["certified", "award", "accredited"]))),
            "has_case_studies": bool(soup.find(string=lambda text: text and "case study" in text.lower())),
        }
        
        return {
            "url": url,
            "seo_score": analysis["score"],
            "seo_summary": analysis["summary"],
            "social_presence": {
                "social_links_found": len(social_links),
                "platforms": list(set([link.split(".")[1] if "." in link else "unknown" for link in social_links[:5]])),
            },
            "contact_accessibility": contact_info,
            "trust_signals": trust_signals,
            "recommendations": [
                "Improve SEO score to match or exceed competitors",
                "Enhance social media presence" if len(social_links) < 2 else "Maintain strong social presence",
                "Add trust signals like testimonials and certifications",
                "Ensure contact information is easily accessible",
            ],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(exc)}") from exc


@router.post("/report", status_code=status.HTTP_200_OK)
@limiter.limit("2/hour")
async def generate_report(
    request: Request,
    payload: IntelligenceReportRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Generate competitive intelligence report (requires email)."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)
    
    url_str = str(payload.url)
    
    try:
        report = await generate_intelligence_report(url_str)
        
        # Always capture as lead (email required)
        await upsert_lead(
            session,
            full_name=payload.email.split("@")[0],
            email=payload.email,
            company=None,
            details=f"Competitive Intelligence Report requested\nURL: {url_str}\nSEO Score: {report['seo_score']}/100",
            source="intelligence-report",
        )
        
        # Send comprehensive report via email
        report_body = f"""
Competitive Intelligence Report for {url_str}

SEO ANALYSIS
Score: {report['seo_score']}/100

SOCIAL PRESENCE
Social Links Found: {report['social_presence']['social_links_found']}
Platforms: {', '.join(report['social_presence']['platforms'])}

CONTACT ACCESSIBILITY
Phone: {'Yes' if report['contact_accessibility']['has_phone'] else 'No'}
Email: {'Yes' if report['contact_accessibility']['has_email'] else 'No'}
Address: {'Yes' if report['contact_accessibility']['has_address'] else 'No'}

TRUST SIGNALS
Testimonials: {'Yes' if report['trust_signals']['has_testimonials'] else 'No'}
Certifications: {'Yes' if report['trust_signals']['has_certifications'] else 'No'}
Case Studies: {'Yes' if report['trust_signals']['has_case_studies'] else 'No'}

KEY RECOMMENDATIONS
"""
        for rec in report["recommendations"]:
            report_body += f"\n- {rec}\n"
        
        report_body += "\n\nWant a comprehensive competitive analysis?\nBook a free consultation: https://carolinagrowth.co/contact"
        
        background_tasks.add_task(
            send_email,
            to_address=payload.email,
            subject=f"Competitive Intelligence Report: {url_str}",
            body=report_body,
        )
        
        background_tasks.add_task(
            notify_admin,
            subject="New competitive intelligence report request",
            body=f"Email: {payload.email}\nURL: {url_str}",
            reply_to=payload.email,
        )
        
        # Track feature usage
        capture_feature_usage(
            feature="competitive_intelligence",
            user_id=payload.email,
            metadata={
                "url": url_str,
                "seo_score": report["seo_score"],
            },
        )
        
        return report
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(exc)}") from exc
