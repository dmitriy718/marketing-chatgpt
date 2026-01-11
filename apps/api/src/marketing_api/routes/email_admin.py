import logging
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.auth.dependencies import get_current_user
from marketing_api.db.models import EmailCampaign, EmailSequence, EmailSend, EmailSubscriber, Lead, NewsletterSignup, User
from marketing_api.db.session import get_session

router = APIRouter(prefix="/admin/email", tags=["email-admin"])
logger = logging.getLogger(__name__)


# Request/Response Models
class CampaignCreate(BaseModel):
    name: str
    type: str
    status: str = "draft"


class CampaignUpdate(BaseModel):
    name: str | None = None
    status: str | None = None


class SequenceCreate(BaseModel):
    campaign_id: UUID
    step_number: int
    delay_days: int = 0
    subject: str
    body: str


class SequenceUpdate(BaseModel):
    step_number: int | None = None
    delay_days: int | None = None
    subject: str | None = None
    body: str | None = None


class SubscriberUpdate(BaseModel):
    status: str | None = None
    tags: str | None = None


# Campaign Management
@router.get("/campaigns")
async def list_campaigns(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """List all email campaigns."""
    result = await session.execute(select(EmailCampaign).order_by(EmailCampaign.created_at.desc()))
    campaigns = result.scalars().all()
    
    # Optimize: Single query for sequence counts
    seq_counts = await session.execute(
        select(EmailSequence.campaign_id, func.count(EmailSequence.id).label("count"))
        .group_by(EmailSequence.campaign_id)
    )
    seq_count_map = {str(row[0]): row[1] for row in seq_counts.all()}
    
    # Optimize: Single query for subscriber count
    sub_count_result = await session.execute(
        select(func.count(EmailSubscriber.id)).where(EmailSubscriber.status == "active")
    )
    total_subscribers = sub_count_result.scalar() or 0
    
    campaigns_data = []
    for campaign in campaigns:
        sequence_count = seq_count_map.get(str(campaign.id), 0)
        
        campaigns_data.append({
            "id": str(campaign.id),
            "name": campaign.name,
            "type": campaign.type,
            "status": campaign.status,
        "sequence_count": sequence_count,
        "subscriber_count": total_subscribers,
            "created_at": campaign.created_at.isoformat() if campaign.created_at else None,
        })
    
    return {"campaigns": campaigns_data}


@router.post("/campaigns", status_code=status.HTTP_201_CREATED)
async def create_campaign(
    payload: CampaignCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a new email campaign."""
    campaign = EmailCampaign(
        name=payload.name,
        type=payload.type,
        status=payload.status,
    )
    session.add(campaign)
    await session.commit()
    await session.refresh(campaign)
    
    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "type": campaign.type,
        "status": campaign.status,
    }


@router.put("/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: UUID,
    payload: CampaignUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Update an email campaign."""
    result = await session.execute(select(EmailCampaign).where(EmailCampaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    if payload.name is not None:
        campaign.name = payload.name
    if payload.status is not None:
        campaign.status = payload.status
    
    await session.commit()
    await session.refresh(campaign)
    
    return {
        "id": str(campaign.id),
        "name": campaign.name,
        "type": campaign.type,
        "status": campaign.status,
    }


@router.delete("/campaigns/{campaign_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campaign(
    campaign_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an email campaign (cascades to sequences)."""
    result = await session.execute(select(EmailCampaign).where(EmailCampaign.id == campaign_id))
    campaign = result.scalar_one_or_none()
    
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    await session.delete(campaign)
    await session.commit()


# Sequence Management
@router.get("/campaigns/{campaign_id}/sequences")
async def list_sequences(
    campaign_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """List sequences for a campaign."""
    result = await session.execute(
        select(EmailSequence)
        .where(EmailSequence.campaign_id == campaign_id)
        .order_by(EmailSequence.step_number)
    )
    sequences = result.scalars().all()
    
    sequences_data = []
    for seq in sequences:
        # Count sends
        send_count = await session.execute(
            select(func.count(EmailSend.id)).where(EmailSend.sequence_id == seq.id)
        )
        sends = send_count.scalar() or 0
        
        sequences_data.append({
            "id": str(seq.id),
            "campaign_id": str(seq.campaign_id),
            "step_number": seq.step_number,
            "delay_days": seq.delay_days,
            "subject": seq.subject,
            "body": seq.body,
            "sends": sends,
            "created_at": seq.created_at.isoformat() if seq.created_at else None,
        })
    
    return {"sequences": sequences_data}


@router.post("/sequences", status_code=status.HTTP_201_CREATED)
async def create_sequence(
    payload: SequenceCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Create a new email sequence."""
    # Verify campaign exists
    campaign_result = await session.execute(
        select(EmailCampaign).where(EmailCampaign.id == payload.campaign_id)
    )
    if not campaign_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Campaign not found")
    
    sequence = EmailSequence(
        campaign_id=payload.campaign_id,
        step_number=payload.step_number,
        delay_days=payload.delay_days,
        subject=payload.subject,
        body=payload.body,
    )
    session.add(sequence)
    await session.commit()
    await session.refresh(sequence)
    
    return {
        "id": str(sequence.id),
        "campaign_id": str(sequence.campaign_id),
        "step_number": sequence.step_number,
        "delay_days": sequence.delay_days,
        "subject": sequence.subject,
        "body": sequence.body,
    }


@router.put("/sequences/{sequence_id}")
async def update_sequence(
    sequence_id: UUID,
    payload: SequenceUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Update an email sequence."""
    result = await session.execute(select(EmailSequence).where(EmailSequence.id == sequence_id))
    sequence = result.scalar_one_or_none()
    
    if not sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
    
    if payload.step_number is not None:
        sequence.step_number = payload.step_number
    if payload.delay_days is not None:
        sequence.delay_days = payload.delay_days
    if payload.subject is not None:
        sequence.subject = payload.subject
    if payload.body is not None:
        sequence.body = payload.body
    
    await session.commit()
    await session.refresh(sequence)
    
    return {
        "id": str(sequence.id),
        "campaign_id": str(sequence.campaign_id),
        "step_number": sequence.step_number,
        "delay_days": sequence.delay_days,
        "subject": sequence.subject,
        "body": sequence.body,
    }


@router.delete("/sequences/{sequence_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sequence(
    sequence_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete an email sequence."""
    result = await session.execute(select(EmailSequence).where(EmailSequence.id == sequence_id))
    sequence = result.scalar_one_or_none()
    
    if not sequence:
        raise HTTPException(status_code=404, detail="Sequence not found")
    
    await session.delete(sequence)
    await session.commit()


# Subscriber Management
@router.get("/subscribers")
async def list_subscribers(
    status_filter: str | None = None,
    limit: int = 100,
    offset: int = 0,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """List email subscribers with optional filtering."""
    query = select(EmailSubscriber)
    
    if status_filter:
        query = query.where(EmailSubscriber.status == status_filter)
    
    query = query.order_by(EmailSubscriber.subscribed_at.desc()).limit(limit).offset(offset)
    
    result = await session.execute(query)
    subscribers = result.scalars().all()
    
    # Get total count
    count_query = select(func.count(EmailSubscriber.id))
    if status_filter:
        count_query = count_query.where(EmailSubscriber.status == status_filter)
    total_result = await session.execute(count_query)
    total = total_result.scalar() or 0
    
    # Optimize: Batch query for send counts
    subscriber_ids = [sub.id for sub in subscribers]
    if subscriber_ids:
        send_counts = await session.execute(
            select(EmailSend.subscriber_id, func.count(EmailSend.id).label("count"))
            .where(EmailSend.subscriber_id.in_(subscriber_ids))
            .group_by(EmailSend.subscriber_id)
        )
        send_count_map = {str(row[0]): row[1] for row in send_counts.all()}
        
        open_counts = await session.execute(
            select(EmailSend.subscriber_id, func.count(EmailSend.id).label("count"))
            .where(
                EmailSend.subscriber_id.in_(subscriber_ids),
                EmailSend.opened_at.isnot(None),
            )
            .group_by(EmailSend.subscriber_id)
        )
        open_count_map = {str(row[0]): row[1] for row in open_counts.all()}
    else:
        send_count_map = {}
        open_count_map = {}
    
    subscribers_data = []
    for sub in subscribers:
        sends = send_count_map.get(str(sub.id), 0)
        opens = open_count_map.get(str(sub.id), 0)
        
        subscribers_data.append({
            "id": str(sub.id),
            "email": sub.email,
            "status": sub.status,
            "tags": sub.tags,
            "sends": sends,
            "opens": opens,
            "subscribed_at": sub.subscribed_at.isoformat() if sub.subscribed_at else None,
        })
    
    return {
        "subscribers": subscribers_data,
        "total": total,
        "limit": limit,
        "offset": offset,
    }


@router.put("/subscribers/{subscriber_id}")
async def update_subscriber(
    subscriber_id: UUID,
    payload: SubscriberUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Update a subscriber."""
    result = await session.execute(
        select(EmailSubscriber).where(EmailSubscriber.id == subscriber_id)
    )
    subscriber = result.scalar_one_or_none()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    if payload.status is not None:
        subscriber.status = payload.status
    if payload.tags is not None:
        subscriber.tags = payload.tags
    
    await session.commit()
    await session.refresh(subscriber)
    
    return {
        "id": str(subscriber.id),
        "email": subscriber.email,
        "status": subscriber.status,
        "tags": subscriber.tags,
    }


@router.delete("/subscribers/{subscriber_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscriber(
    subscriber_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    """Delete a subscriber."""
    result = await session.execute(
        select(EmailSubscriber).where(EmailSubscriber.id == subscriber_id)
    )
    subscriber = result.scalar_one_or_none()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    await session.delete(subscriber)
    await session.commit()


# Analytics & Statistics
@router.get("/analytics")
async def get_email_analytics(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Get email automation analytics."""
    # Total subscribers
    total_subs = await session.execute(select(func.count(EmailSubscriber.id)))
    total_subscribers = total_subs.scalar() or 0
    
    # Active subscribers
    active_subs = await session.execute(
        select(func.count(EmailSubscriber.id)).where(EmailSubscriber.status == "active")
    )
    active_subscribers = active_subs.scalar() or 0
    
    # Total campaigns
    total_camps = await session.execute(select(func.count(EmailCampaign.id)))
    total_campaigns = total_camps.scalar() or 0
    
    # Active campaigns
    active_camps = await session.execute(
        select(func.count(EmailCampaign.id)).where(EmailCampaign.status == "active")
    )
    active_campaigns = active_camps.scalar() or 0
    
    # Total sends
    total_sends_result = await session.execute(select(func.count(EmailSend.id)))
    total_sends = total_sends_result.scalar() or 0
    
    # Opens
    opens_result = await session.execute(
        select(func.count(EmailSend.id)).where(EmailSend.opened_at.isnot(None))
    )
    opens = opens_result.scalar() or 0
    
    # Clicks
    clicks_result = await session.execute(
        select(func.count(EmailSend.id)).where(EmailSend.clicked_at.isnot(None))
    )
    clicks = clicks_result.scalar() or 0
    
    # Open rate
    open_rate = (opens / total_sends * 100) if total_sends > 0 else 0
    
    # Click rate
    click_rate = (clicks / total_sends * 100) if total_sends > 0 else 0
    
    # Recent activity (last 30 days)
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    recent_sends = await session.execute(
        select(func.count(EmailSend.id))
        .where(EmailSend.sent_at >= thirty_days_ago)
    )
    recent_sends_count = recent_sends.scalar() or 0
    
    return {
        "subscribers": {
            "total": total_subscribers,
            "active": active_subscribers,
            "unsubscribed": total_subscribers - active_subscribers,
        },
        "campaigns": {
            "total": total_campaigns,
            "active": active_campaigns,
            "draft": total_campaigns - active_campaigns,
        },
        "sends": {
            "total": total_sends,
            "opens": opens,
            "clicks": clicks,
            "open_rate": round(open_rate, 2),
            "click_rate": round(click_rate, 2),
            "recent_30_days": recent_sends_count,
        },
    }


# Form-to-Campaign Mapping
@router.get("/form-sources")
async def get_form_sources(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """Get all form sources that can be mapped to campaigns."""
    # Get all unique lead sources
    lead_sources = await session.execute(
        select(Lead.source).distinct().where(Lead.source.isnot(None))
    )
    sources = [row[0] for row in lead_sources.all() if row[0]]
    
    # Get newsletter signups
    newsletter_sources = await session.execute(
        select(NewsletterSignup.lead_magnet).distinct().where(NewsletterSignup.lead_magnet.isnot(None))
    )
    newsletter_sources_list = [row[0] for row in newsletter_sources.all() if row[0]]
    
    return {
        "lead_sources": sources,
        "newsletter_sources": newsletter_sources_list,
        "all_sources": sorted(set(sources + newsletter_sources_list)),
    }
