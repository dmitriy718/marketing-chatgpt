from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import ConsultationBooking
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


def resolve_requested_datetime(
    preferred_date: str | None, preferred_time: str | None
) -> datetime:
    if not preferred_date:
        return datetime.now(timezone.utc) + timedelta(days=1)
    try:
        date_part = datetime.fromisoformat(preferred_date).date()
    except ValueError:
        return datetime.now(timezone.utc) + timedelta(days=1)

    time_map = {
        "morning": (9, 0),
        "afternoon": (14, 0),
        "evening": (18, 0),
    }
    hour, minute = time_map.get(preferred_time or "", (10, 0))
    return datetime(
        date_part.year,
        date_part.month,
        date_part.day,
        hour,
        minute,
        tzinfo=timezone.utc,
    )


@router.post("/book", status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")
async def book_consultation(
    request: Request,
    payload: ConsultationRequest,
    background_tasks: BackgroundTasks,
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

    scheduled_at = resolve_requested_datetime(
        payload.preferred_date, payload.preferred_time
    )
    booking = ConsultationBooking(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        company=payload.company,
        scheduled_at=scheduled_at,
        notes="\n".join(
            [
                f"Preferred date: {payload.preferred_date or 'Flexible'}",
                f"Preferred time: {payload.preferred_time or 'Flexible'}",
                payload.message or "No additional message",
            ]
        ),
    )
    session.add(booking)
    await session.commit()
    
    # Send confirmation to client
    background_tasks.add_task(
        send_email,
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
    background_tasks.add_task(
        notify_admin,
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
