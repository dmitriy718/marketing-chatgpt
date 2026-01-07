from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import BugReport, Lead, LeadStatus, NewsletterSignup
from marketing_api.db.session import get_session

router = APIRouter(prefix="/public", tags=["public"])


class PublicLeadRequest(BaseModel):
    name: str
    email: EmailStr
    company: str
    budget: str | None = None
    details: str
    source: str | None = None


class NewsletterSignupRequest(BaseModel):
    email: EmailStr
    lead_magnet: str | None = None


class BugReportRequest(BaseModel):
    message: str
    stack: str | None = None
    digest: str | None = None
    url: str | None = None
    user_agent: str | None = None
    referrer: str | None = None
    context: str | None = None


@router.post("/leads", status_code=status.HTTP_201_CREATED)
async def capture_lead(
    payload: PublicLeadRequest, session: AsyncSession = Depends(get_session)
) -> dict[str, str]:
    lead = Lead(
        full_name=payload.name,
        email=payload.email,
        company=payload.company,
        budget=payload.budget,
        details=payload.details,
        source=payload.source or "web",
        status=LeadStatus.new,
    )
    session.add(lead)
    await session.commit()
    return {"status": "ok"}


@router.post("/newsletter", status_code=status.HTTP_201_CREATED)
async def capture_newsletter_signup(
    payload: NewsletterSignupRequest, session: AsyncSession = Depends(get_session)
) -> dict[str, str]:
    signup = NewsletterSignup(email=payload.email, lead_magnet=payload.lead_magnet)
    session.add(signup)
    await session.commit()
    return {"status": "ok"}


@router.post("/bug-reports", status_code=status.HTTP_201_CREATED)
async def capture_bug_report(
    payload: BugReportRequest, session: AsyncSession = Depends(get_session)
) -> dict[str, str]:
    report = BugReport(
        message=payload.message,
        stack=payload.stack,
        digest=payload.digest,
        url=payload.url,
        user_agent=payload.user_agent,
        referrer=payload.referrer,
        context=payload.context,
    )
    session.add(report)
    await session.commit()
    return {"status": "ok"}
