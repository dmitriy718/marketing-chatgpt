import asyncio
import json
import logging
from datetime import datetime, timezone

import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db import models
from marketing_api.db.session import get_session
from marketing_api.db.stripe_session import get_stripe_sessionmaker
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.settings import settings

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
logger = logging.getLogger(__name__)


async def get_customer_details(customer_id: str | None) -> tuple[str | None, str | None]:
    if not customer_id:
        return None, None
    try:
        customer = stripe.Customer.retrieve(customer_id)
    except Exception:
        return None, None
    return customer.get("email"), customer.get("name")


def merge_details(existing: str | None, new: str) -> str:
    if not existing:
        return new
    if new in existing:
        return existing
    return f"{existing}\n\n{new}"


def format_currency(amount: int | None) -> str:
    if amount is None:
        return "Unknown"
    return f"${amount / 100:,.2f}"


def dispatch_email(*, to_address: str, subject: str, body: str) -> None:
    asyncio.create_task(
        asyncio.to_thread(send_email, to_address=to_address, subject=subject, body=body)
    )


def dispatch_admin(subject: str, body: str, reply_to: str | None = None) -> None:
    asyncio.create_task(
        asyncio.to_thread(notify_admin, subject=subject, body=body, reply_to=reply_to)
    )


async def record_stripe_lead(
    session: AsyncSession,
    *,
    email: str | None,
    name: str | None,
    details: str,
) -> None:
    if not email:
        return

    existing = await session.execute(select(models.Lead).where(models.Lead.email == email))
    lead = existing.scalar_one_or_none()
    if lead:
        lead.full_name = lead.full_name or name or email
        lead.details = merge_details(lead.details, details)
        lead.status = models.LeadStatus.converted
        await session.commit()
        return

    new_lead = models.Lead(
        full_name=name or email,
        email=email,
        company=name or None,
        details=details,
        source="stripe",
        status=models.LeadStatus.converted,
    )
    session.add(new_lead)
    await session.commit()


async def record_stripe_transaction(
    session: AsyncSession,
    *,
    event: stripe.Event,
    data: dict,
    event_created_at: datetime | None,
) -> None:
    event_type = event.type
    object_type = None
    if event_type.startswith("payment_intent."):
        object_type = "payment_intent"
    elif event_type.startswith("invoice."):
        object_type = "invoice"
    else:
        return

    object_id = data.get("id")
    if not object_id:
        return

    if object_type == "payment_intent":
        amount = data.get("amount_received") or data.get("amount")
        status = data.get("status")
        currency = data.get("currency")
        customer_id = data.get("customer")
        customer_email = data.get("receipt_email") or data.get("customer_email")
        description = data.get("description")
    else:
        amount = data.get("amount_paid") or data.get("amount_due") or data.get("amount_remaining")
        status = data.get("status")
        currency = data.get("currency")
        customer_id = data.get("customer")
        customer_email = data.get("customer_email")
        description = data.get("description")

    metadata = data.get("metadata") or None
    metadata_json = json.dumps(metadata) if metadata else None

    existing = await session.execute(
        select(models.StripeTransaction).where(
            models.StripeTransaction.stripe_object_id == object_id,
            models.StripeTransaction.object_type == object_type,
        )
    )
    record = existing.scalar_one_or_none()
    if record:
        record.status = status
        record.amount = amount
        record.currency = currency
        record.customer_id = customer_id
        record.customer_email = customer_email
        record.description = description
        record.metadata_json = metadata_json
        record.event_id = event.id
        record.event_type = event_type
        record.livemode = bool(event.livemode)
        record.event_created_at = event_created_at
        await session.commit()
        return

    session.add(
        models.StripeTransaction(
            stripe_object_id=object_id,
            object_type=object_type,
            status=status,
            amount=amount,
            currency=currency,
            customer_id=customer_id,
            customer_email=customer_email,
            description=description,
            metadata_json=metadata_json,
            event_id=event.id,
            event_type=event_type,
            livemode=bool(event.livemode),
            event_created_at=event_created_at,
        )
    )
    await session.commit()


async def handle_payment_intent(session: AsyncSession, data: dict) -> None:
    customer_id = data.get("customer")
    email = data.get("receipt_email") or data.get("customer_email")
    name = data.get("shipping", {}).get("name") if isinstance(data.get("shipping"), dict) else None
    if not email:
        customer_email, customer_name = await get_customer_details(customer_id)
        email = customer_email
        name = name or customer_name
    metadata = data.get("metadata") or {}
    plan_label = metadata.get("plan_label") or data.get("description") or "Stripe payment"
    amount = data.get("amount_received") or data.get("amount")
    details = "\n".join(
        [
            "Stripe payment succeeded",
            f"Plan: {plan_label}",
            f"Amount: {amount}",
            f"Payment intent: {data.get('id')}",
        ]
    )
    await record_stripe_lead(session, email=email, name=name, details=details)

    if email:
        customer_body = "\n".join(
            [
                f"Hi {name or 'there'},",
                "",
                "Thanks for your payment with Carolina Growth.",
                f"Amount: {format_currency(amount)}",
                f"Plan: {plan_label}",
                "",
                "We will follow up shortly.",
            ]
        )
        dispatch_email(to_address=email, subject="Payment received", body=customer_body)

    admin_body = "\n".join(
        [
            "New Stripe payment",
            f"Email: {email or 'Unknown'}",
            f"Name: {name or 'Unknown'}",
            f"Amount: {format_currency(amount)}",
            f"Plan: {plan_label}",
            f"Payment intent: {data.get('id')}",
        ]
    )
    dispatch_admin(subject="Stripe payment received", body=admin_body, reply_to=email)


async def handle_payment_failed(session: AsyncSession, data: dict) -> None:
    customer_id = data.get("customer")
    email = data.get("receipt_email") or data.get("customer_email")
    name = data.get("shipping", {}).get("name") if isinstance(data.get("shipping"), dict) else None
    if not email:
        customer_email, customer_name = await get_customer_details(customer_id)
        email = customer_email
        name = name or customer_name

    amount = data.get("amount") or data.get("amount_received")
    reason = None
    error_payload = data.get("last_payment_error")
    if isinstance(error_payload, dict):
        reason = error_payload.get("message") or error_payload.get("code")

    admin_body = "\n".join(
        [
            "Stripe payment failed",
            f"Email: {email or 'Unknown'}",
            f"Name: {name or 'Unknown'}",
            f"Amount: {format_currency(amount)}",
            f"Payment intent: {data.get('id')}",
            f"Reason: {reason or 'Unknown'}",
        ]
    )
    dispatch_admin(subject="Stripe payment failed", body=admin_body, reply_to=email)

    if email:
        customer_body = "\n".join(
            [
                f"Hi {name or 'there'},",
                "",
                "We were unable to process your payment.",
                f"Amount: {format_currency(amount)}",
                "Please retry or contact us if you need help.",
                "",
                "— Carolina Growth",
            ]
        )
        dispatch_email(to_address=email, subject="Payment failed", body=customer_body)


async def handle_invoice_paid(session: AsyncSession, data: dict) -> None:
    customer_id = data.get("customer")
    email = data.get("customer_email")
    name = data.get("customer_name")
    if not email:
        customer_email, customer_name = await get_customer_details(customer_id)
        email = customer_email
        name = name or customer_name

    plan_label = data.get("metadata", {}).get("plan_label")
    subscription_id = data.get("subscription")
    if subscription_id and not plan_label:
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            plan_label = subscription.get("metadata", {}).get("plan_label")
        except Exception:
            plan_label = plan_label
    plan_label = plan_label or "Stripe subscription"

    details = "\n".join(
        [
            "Stripe invoice paid",
            f"Plan: {plan_label}",
            f"Amount paid: {data.get('amount_paid')}",
            f"Invoice: {data.get('id')}",
            f"Subscription: {subscription_id or 'n/a'}",
        ]
    )
    await record_stripe_lead(session, email=email, name=name, details=details)

    if email:
        customer_body = "\n".join(
            [
                f"Hi {name or 'there'},",
                "",
                "Thanks for your subscription payment with Carolina Growth.",
                f"Amount: {format_currency(data.get('amount_paid'))}",
                f"Plan: {plan_label}",
                "",
                "We will follow up shortly.",
            ]
        )
        dispatch_email(
            to_address=email,
            subject="Subscription payment received",
            body=customer_body,
        )

    admin_body = "\n".join(
        [
            "Stripe subscription payment received",
            f"Email: {email or 'Unknown'}",
            f"Name: {name or 'Unknown'}",
            f"Amount: {format_currency(data.get('amount_paid'))}",
            f"Plan: {plan_label}",
            f"Invoice: {data.get('id')}",
            f"Subscription: {subscription_id or 'n/a'}",
        ]
    )
    dispatch_admin(subject="Stripe subscription payment", body=admin_body, reply_to=email)


async def handle_invoice_failed(session: AsyncSession, data: dict) -> None:
    customer_id = data.get("customer")
    email = data.get("customer_email")
    name = data.get("customer_name")
    if not email:
        customer_email, customer_name = await get_customer_details(customer_id)
        email = customer_email
        name = name or customer_name

    amount = data.get("amount_due") or data.get("amount_remaining") or data.get("amount_paid")
    reason = data.get("failure_message") or data.get("failure_reason")

    admin_body = "\n".join(
        [
            "Stripe invoice payment failed",
            f"Email: {email or 'Unknown'}",
            f"Name: {name or 'Unknown'}",
            f"Amount: {format_currency(amount)}",
            f"Invoice: {data.get('id')}",
            f"Reason: {reason or 'Unknown'}",
        ]
    )
    dispatch_admin(subject="Stripe invoice payment failed", body=admin_body, reply_to=email)

    if email:
        customer_body = "\n".join(
            [
                f"Hi {name or 'there'},",
                "",
                "We were unable to collect your invoice payment.",
                f"Amount: {format_currency(amount)}",
                "Please update your payment method or contact us for help.",
                "",
                "— Carolina Growth",
            ]
        )
        dispatch_email(to_address=email, subject="Invoice payment failed", body=customer_body)


@router.post("/stripe", status_code=status.HTTP_200_OK)
async def handle_stripe_webhook(
    request: Request, session: AsyncSession = Depends(get_session)
) -> dict[str, str]:
    if settings.app_env == "production" and not settings.stripe_database_url:
        dispatch_admin(
            subject="Stripe transaction storage missing",
            body="STRIPE_DATABASE_URL is not configured in production. Webhook aborted.",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe transaction storage unavailable.",
        )
    payload = await request.body()
    # Try both lowercase and original case for stripe-signature header
    sig_header = request.headers.get("stripe-signature") or request.headers.get("Stripe-Signature")

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

    event_type = event.type
    data_object = event.data.object if event.data else None
    if isinstance(data_object, dict):
        try:
            sessionmaker = get_stripe_sessionmaker()
            async with sessionmaker() as stripe_session:
                await record_stripe_transaction(
                    stripe_session,
                    event=event,
                    data=data_object,
                    event_created_at=event_created_at,
                )
        except Exception:  # noqa: BLE001
            logger.exception("Failed to persist Stripe transaction event %s", event.id)
            dispatch_admin(
                subject="Stripe transaction storage failure",
                body=f"Failed to store Stripe transaction event {event.id}.",
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe transaction storage unavailable.",
            )
        if event_type == "payment_intent.succeeded":
            await handle_payment_intent(session, data_object)
        elif event_type == "payment_intent.payment_failed":
            await handle_payment_failed(session, data_object)
        elif event_type == "invoice.paid":
            await handle_invoice_paid(session, data_object)
        elif event_type == "invoice.payment_failed":
            await handle_invoice_failed(session, data_object)

    return {"status": "ok"}
