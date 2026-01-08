import json
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db import models
from marketing_api.db.session import get_session
from marketing_api.settings import settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def handle_stripe_webhook(
    request: Request, session: AsyncSession = Depends(get_session)
) -> dict[str, str]:
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    stripe.api_key = settings.stripe_secret_key

    if settings.app_env == "production" and (
        not settings.stripe_webhook_secret
        or settings.stripe_webhook_secret == "whsec_change_me"
    ):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook secret not configured.",
        )

    try:
        if settings.stripe_webhook_secret and settings.stripe_webhook_secret != "whsec_change_me":
            if not sig_header:
                raise HTTPException(status_code=400, detail="Missing Stripe signature.")
            event = stripe.Webhook.construct_event(
                payload=payload,
                sig_header=sig_header,
                secret=settings.stripe_webhook_secret,
            )
        else:
            event = stripe.Event.construct_from(json.loads(payload.decode("utf-8")), stripe.api_key)
    except (ValueError, json.JSONDecodeError) as exc:
        raise HTTPException(status_code=400, detail="Invalid payload.") from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(status_code=400, detail="Invalid Stripe signature.") from exc

    existing = await session.execute(
        select(models.StripeWebhookEvent).where(models.StripeWebhookEvent.event_id == event.id)
    )
    if existing.scalar_one_or_none():
        return {"status": "ok"}

    data_object = event.data.object if event.data else None
    data_object_id = getattr(data_object, "id", None) if data_object else None
    event_created_at = (
        datetime.fromtimestamp(event.created, tz=timezone.utc) if getattr(event, "created", None) else None
    )

    record = models.StripeWebhookEvent(
        event_id=event.id,
        event_type=event.type,
        livemode=bool(event.livemode),
        event_created_at=event_created_at,
        data_object_id=data_object_id,
        payload=json.dumps(event.to_dict()),
    )
    session.add(record)
    await session.commit()

    return {"status": "ok"}
