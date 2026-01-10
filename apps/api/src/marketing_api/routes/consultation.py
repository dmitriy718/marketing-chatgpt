from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile, upsert_lead

router = APIRouter(prefix="/public/consultation", tags=["consultation"])


class ConsultationRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str | None = None
    company: str | None = None
    preferred_date: str | None = None  # ISO date string
    preferred_time: str | None = None  # "morning", "afternoon", "evening"
    message: str | None = None
    turnstile_token: str | None = None


@router.post("/book", status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")
async def book_consultation(
    request: Request,
    payload: ConsultationRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Book a free consultation."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)
    
    # Capture as high-priority lead
    await upsert_lead(
        session,
        full_name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        details=f"Free Consultation Request\nPreferred: {payload.preferred_date or 'Flexible'} {payload.preferred_time or ''}\n\n{payload.message or 'No additional message'}",
        source="consultation-booking",
    )
    
    # Send confirmation to client
    await send_email(
        to_address=payload.email,
        subject="Consultation Request Received - Carolina Growth",
        body=f"""
Hi {payload.name},

Thank you for requesting a free consultation with Carolina Growth!

We've received your request and will contact you within 24 hours to schedule your consultation.

Request Details:
- Preferred Date: {payload.preferred_date or 'Flexible'}
- Preferred Time: {payload.preferred_time or 'Flexible'}
- Company: {payload.company or 'Not provided'}

{payload.message and f'Your Message:\n{payload.message}\n' or ''}

We look forward to helping you grow your business!

Best regards,
Carolina Growth Team
""",
    )
    
    # Notify admin
    await notify_admin(
        subject="New Consultation Request - HIGH PRIORITY",
        body=f"""
New consultation request received:

Name: {payload.name}
Email: {payload.email}
Phone: {payload.phone or 'Not provided'}
Company: {payload.company or 'Not provided'}
Preferred Date: {payload.preferred_date or 'Flexible'}
Preferred Time: {payload.preferred_time or 'Flexible'}

Message:
{payload.message or 'No additional message'}

Contact within 24 hours!
""",
        reply_to=payload.email,
    )
    
    return {
        "status": "ok",
        "message": "Consultation request received. We'll contact you within 24 hours.",
    }
