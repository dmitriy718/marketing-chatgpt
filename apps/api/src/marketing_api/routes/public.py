from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

import stripe

from marketing_api.db.models import BugReport, ChatMessage, Lead, LeadStatus, NewsletterSignup
from marketing_api.db.session import get_session
from marketing_api.notifications.email import notify_admin, send_email
from marketing_api.notifications.pushover import send_pushover
from marketing_api.settings import settings

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


class ChatMessageRequest(BaseModel):
    name: str
    email: EmailStr | None = None
    message: str
    page_url: str | None = None
    user_agent: str | None = None
    referrer: str | None = None


class StripeSubscriptionRequest(BaseModel):
    price_id: str
    name: str
    email: EmailStr
    plan_label: str | None = None


class StripePaymentIntentRequest(BaseModel):
    amount: int
    name: str
    email: EmailStr
    description: str | None = None


class StripeInvoiceRequest(BaseModel):
    amount: int
    name: str
    email: EmailStr
    description: str | None = None
    days_until_due: int | None = None


def configure_stripe() -> None:
    if not settings.stripe_secret_key or settings.stripe_secret_key == "sk_test_change_me":
        raise HTTPException(status_code=500, detail="Stripe is not configured.")
    stripe.api_key = settings.stripe_secret_key


def get_or_create_customer(name: str, email: str):
    customers = stripe.Customer.list(email=email, limit=1)
    if customers.data:
        customer = customers.data[0]
        if name and not customer.name:
            stripe.Customer.modify(customer.id, name=name)
        return customer
    return stripe.Customer.create(name=name, email=email)


@router.post("/leads", status_code=status.HTTP_201_CREATED)
async def capture_lead(
    payload: PublicLeadRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
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

    admin_body = "\n".join(
        [
            "New lead captured",
            "",
            f"Name: {payload.name}",
            f"Email: {payload.email}",
            f"Company: {payload.company}",
            f"Budget: {payload.budget or 'Not provided'}",
            f"Source: {payload.source or 'web'}",
            "",
            payload.details,
        ]
    )
    background_tasks.add_task(
        notify_admin,
        subject="New lead captured",
        body=admin_body,
        reply_to=payload.email,
    )

    confirmation_body = "\n".join(
        [
            f"Hi {payload.name},",
            "",
            "Thanks for reaching out to Carolina Growth.",
            "We received your request and will follow up shortly.",
            "",
            "If you have any additional details, reply to this email.",
            "",
            "— Carolina Growth",
        ]
    )
    background_tasks.add_task(
        send_email,
        to_address=payload.email,
        subject="We received your request",
        body=confirmation_body,
    )
    return {"status": "ok"}


@router.post("/newsletter", status_code=status.HTTP_201_CREATED)
async def capture_newsletter_signup(
    payload: NewsletterSignupRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    signup = NewsletterSignup(email=payload.email, lead_magnet=payload.lead_magnet)
    session.add(signup)
    await session.commit()

    admin_body = "\n".join(
        [
            "New newsletter signup",
            "",
            f"Email: {payload.email}",
            f"Lead magnet: {payload.lead_magnet or 'None'}",
        ]
    )
    background_tasks.add_task(
        notify_admin,
        subject="New newsletter signup",
        body=admin_body,
        reply_to=payload.email,
    )

    confirmation_body = "\n".join(
        [
            "Thanks for subscribing to Carolina Growth.",
            "We will send the next update soon.",
            "",
            "— Carolina Growth",
        ]
    )
    background_tasks.add_task(
        send_email,
        to_address=payload.email,
        subject="Subscription confirmed",
        body=confirmation_body,
    )
    return {"status": "ok"}


@router.post("/bug-reports", status_code=status.HTTP_201_CREATED)
async def capture_bug_report(
    payload: BugReportRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
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

    admin_body = "\n".join(
        [
            "New bug report",
            "",
            f"Message: {payload.message}",
            f"URL: {payload.url or 'Unknown'}",
            f"User agent: {payload.user_agent or 'Unknown'}",
            f"Referrer: {payload.referrer or 'Unknown'}",
            f"Digest: {payload.digest or 'None'}",
            "",
            payload.stack or "",
            "",
            payload.context or "",
        ]
    )
    background_tasks.add_task(
        notify_admin,
        subject=f"Bug report on {settings.app_url}",
        body=admin_body,
    )
    return {"status": "ok"}


@router.post("/chat", status_code=status.HTTP_201_CREATED)
async def capture_chat_message(
    payload: ChatMessageRequest,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_session),
) -> dict[str, str]:
    message = ChatMessage(
        name=payload.name,
        email=payload.email,
        message=payload.message,
        page_url=payload.page_url,
        user_agent=payload.user_agent,
        referrer=payload.referrer,
    )
    session.add(message)
    await session.commit()

    summary = "\n".join(
        [
            f"Name: {payload.name}",
            f"Email: {payload.email or 'Not provided'}",
            f"Page: {payload.page_url or 'Unknown'}",
            "",
            payload.message,
        ]
    )

    background_tasks.add_task(
        notify_admin,
        subject="New website message",
        body=summary,
        reply_to=payload.email,
    )
    background_tasks.add_task(
        send_pushover,
        title="New website message",
        message=f"{payload.name}: {payload.message[:200]}".strip(),
    )

    return {"status": "ok"}


@router.post("/stripe/subscription")
async def create_stripe_subscription(payload: StripeSubscriptionRequest) -> dict[str, str]:
    configure_stripe()
    if not payload.price_id:
        raise HTTPException(status_code=400, detail="Missing price ID.")

    customer = get_or_create_customer(payload.name, payload.email)
    subscription = stripe.Subscription.create(
        customer=customer.id,
        items=[{"price": payload.price_id}],
        payment_behavior="default_incomplete",
        expand=["latest_invoice.payment_intent"],
        metadata={"plan_label": payload.plan_label or ""},
    )
    payment_intent = subscription.latest_invoice.payment_intent
    return {
        "client_secret": payment_intent.client_secret,
        "subscription_id": subscription.id,
    }


@router.post("/stripe/payment-intent")
async def create_stripe_payment_intent(payload: StripePaymentIntentRequest) -> dict[str, str]:
    configure_stripe()
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    customer = get_or_create_customer(payload.name, payload.email)
    intent = stripe.PaymentIntent.create(
        amount=payload.amount,
        currency="usd",
        customer=customer.id,
        description=payload.description or "Carolina Growth payment",
        automatic_payment_methods={"enabled": True},
    )
    return {"client_secret": intent.client_secret, "payment_intent_id": intent.id}


@router.post("/stripe/invoice")
async def create_stripe_invoice(payload: StripeInvoiceRequest) -> dict[str, str]:
    configure_stripe()
    if payload.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero.")

    customer = get_or_create_customer(payload.name, payload.email)
    stripe.InvoiceItem.create(
        customer=customer.id,
        amount=payload.amount,
        currency="usd",
        description=payload.description or "Custom package deposit",
    )
    invoice = stripe.Invoice.create(
        customer=customer.id,
        collection_method="send_invoice",
        days_until_due=payload.days_until_due or 1,
        auto_advance=True,
    )
    finalized = stripe.Invoice.finalize_invoice(invoice.id)
    stripe.Invoice.send_invoice(finalized.id)
    return {
        "invoice_id": finalized.id,
        "hosted_invoice_url": finalized.hosted_invoice_url,
    }
