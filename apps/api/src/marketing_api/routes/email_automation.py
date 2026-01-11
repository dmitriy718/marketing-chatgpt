import json
import logging
from datetime import datetime, timedelta, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db.models import EmailCampaign, EmailSequence, EmailSend, EmailSubscriber
from marketing_api.db.session import get_session
from marketing_api.limits import limiter
from marketing_api.notifications.email import send_email
from marketing_api.routes.public import should_bypass_turnstile, verify_turnstile
from marketing_api.settings import settings

router = APIRouter(prefix="/public/email", tags=["email-automation"])
logger = logging.getLogger(__name__)


class SubscribeRequest(BaseModel):
    email: EmailStr
    tags: str | None = None
    turnstile_token: str | None = None


@router.post("/subscribe", status_code=status.HTTP_200_OK)
@limiter.limit("10/hour")
async def subscribe(
    request: Request,
    payload: SubscribeRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Subscribe to email campaigns."""
    if not should_bypass_turnstile(request):
        await verify_turnstile(payload.turnstile_token)

    # Check if already subscribed
    existing = await session.execute(
        select(EmailSubscriber).where(EmailSubscriber.email == payload.email)
    )
    subscriber = existing.scalar_one_or_none()

    if subscriber:
        if subscriber.status == "unsubscribed":
            subscriber.status = "active"
            await session.commit()
        return {"status": "ok", "message": "Already subscribed"}
    else:
        subscriber = EmailSubscriber(
            email=payload.email,
            status="active",
            tags=payload.tags,
        )
        session.add(subscriber)
        await session.commit()

    return {"status": "ok", "message": "Subscribed successfully"}


@router.post("/unsubscribe", status_code=status.HTTP_200_OK)
@limiter.limit("10/hour")
async def unsubscribe(
    request: Request,
    payload: SubscribeRequest,
    session: AsyncSession = Depends(get_session),
) -> dict:
    """Unsubscribe from email campaigns."""
    existing = await session.execute(
        select(EmailSubscriber).where(EmailSubscriber.email == payload.email)
    )
    subscriber = existing.scalar_one_or_none()

    if subscriber:
        subscriber.status = "unsubscribed"
        await session.commit()
        return {"status": "ok", "message": "Unsubscribed successfully"}

    return {"status": "ok", "message": "Email not found"}


async def process_email_queue(session: AsyncSession) -> None:
    """Process pending emails in sequences. Called by background task."""
    now = datetime.now(timezone.utc)

    # Find active campaigns
    campaigns = await session.execute(
        select(EmailCampaign).where(EmailCampaign.status == "active")
    )
    active_campaigns = campaigns.scalars().all()

    for campaign in active_campaigns:
        sequences = await session.execute(
            select(EmailSequence)
            .where(EmailSequence.campaign_id == campaign.id)
            .order_by(EmailSequence.step_number)
        )
        sequence_list = sequences.scalars().all()

        # Get active subscribers
        subscribers = await session.execute(
            select(EmailSubscriber).where(EmailSubscriber.status == "active")
        )
        subscriber_list = subscribers.scalars().all()

        for subscriber in subscriber_list:
            for sequence in sequence_list:
                # Check if email should be sent
                # Find last send for this subscriber in this campaign
                last_send = await session.execute(
                    select(EmailSend)
                    .where(
                        EmailSend.subscriber_id == subscriber.id,
                        EmailSend.sequence_id == sequence.id,
                    )
                    .order_by(EmailSend.created_at.desc())
                    .limit(1)
                )
                last = last_send.scalar_one_or_none()

                should_send = False
                if not last:
                    # First email in sequence
                    if sequence.step_number == 1:
                        should_send = True
                else:
                    # Check delay
                    if last.sent_at:
                        delay_date = last.sent_at + timedelta(days=sequence.delay_days)
                        if now >= delay_date:
                            should_send = True

                if should_send:
                    # Send email
                    try:
                        await send_email(
                            to_address=subscriber.email,
                            subject=sequence.subject,
                            body=sequence.body,
                        )

                        # Record send
                        email_send = EmailSend(
                            subscriber_id=subscriber.id,
                            sequence_id=sequence.id,
                            sent_at=now,
                        )
                        session.add(email_send)
                        await session.commit()
                    except Exception as exc:
                        # Log error but continue
                        logger.error(
                            "Failed to send email to %s in sequence %s: %s",
                            subscriber.email,
                            sequence.id,
                            str(exc),
                        )
                        await session.rollback()
