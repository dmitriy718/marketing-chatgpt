from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Security
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.auth.dependencies import get_current_user
from marketing_api.db.models import Lead, LeadStatus, NewsletterSignup, ChatMessage, StripeTransaction, BugReport, User
from marketing_api.db.session import get_session

router = APIRouter(prefix="/admin/dashboard", tags=["admin"])

@router.get("/metrics")
async def get_dashboard_metrics(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Lightweight health dashboard for lead volume and funnel status."""
    
    # Lead volume (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # 1. Lead Funnel
    leads_stmt = select(Lead.status, func.count(Lead.id)).group_by(Lead.status)
    leads_result = await session.execute(leads_stmt)
    leads_by_status = {status.value: count for status, count in leads_result.all()}
    
    # 2. Conversions (Newsletter, Chat, Stripe)
    newsletter_count = await session.scalar(select(func.count(NewsletterSignup.id)))
    chat_count = await session.scalar(select(func.count(ChatMessage.id)))
    
    # Stripe volume
    stripe_stmt = select(func.sum(StripeTransaction.amount)).where(StripeTransaction.status == "succeeded")
    stripe_total = await session.scalar(stripe_stmt) or 0
    
    # 3. Job Queue / System Health
    # Check for recent failures in bug reports as proxy for app stability
    recent_bugs = await session.scalar(
        select(func.count(BugReport.id)).where(BugReport.created_at >= thirty_days_ago)
    )
    
    # 4. Funnel Drop-off (Incomplete Checkouts)
    # Stripe incomplete vs complete
    stripe_incomplete = await session.scalar(
        select(func.count(StripeTransaction.id)).where(StripeTransaction.status != "succeeded")
    )
    
    return {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "leads": {
            "total": sum(leads_by_status.values()),
            "by_status": leads_by_status
        },
        "conversions": {
            "newsletter": newsletter_count,
            "chat": chat_count,
            "revenue_total_cents": stripe_total
        },
        "stability": {
            "recent_bugs_30d": recent_bugs
        },
        "drop_offs": {
            "incomplete_checkouts": stripe_incomplete
        }
    }

@router.get("/delivery-verification")
async def verify_lead_delivery(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[dict[str, Any]]:
    """E2E lead delivery verification (Last 50 leads)."""
    stmt = select(Lead).order_by(Lead.created_at.desc()).limit(50)
    result = await session.execute(stmt)
    leads = result.scalars().all()
    
    verification = []
    for lead in leads:
        # Check if email tasks were spawned (mock check for now as we don't have task logging table)
        verification.append({
            "id": str(lead.id),
            "email": lead.email,
            "created_at": lead.created_at.isoformat(),
            "source": lead.source,
            "status": lead.status.value,
            "delivery_status": "tracked" if lead.status != LeadStatus.lost else "failed"
        })
    
    return verification
