import datetime as dt

import strawberry

from marketing_api.db import models


@strawberry.type
class ServiceSummary:
    slug: str
    name: str
    description: str


@strawberry.type
class UserType:
    id: strawberry.ID
    email: str
    full_name: str | None
    is_active: bool


@strawberry.type
class CustomerType:
    id: strawberry.ID
    name: str
    industry: str | None
    website: str | None
    status: str
    owner_user_id: strawberry.ID | None
    created_at: dt.datetime


@strawberry.type
class LeadType:
    id: strawberry.ID
    full_name: str
    email: str | None
    phone: str | None
    company: str | None
    budget: str | None
    details: str | None
    source: str | None
    status: str
    score: int | None
    assigned_to_user_id: strawberry.ID | None
    customer_id: strawberry.ID | None
    created_at: dt.datetime


@strawberry.type
class PipelineStageType:
    id: strawberry.ID
    name: str
    order: int
    probability: int


@strawberry.type
class DealType:
    id: strawberry.ID
    name: str
    customer_id: strawberry.ID
    stage_id: strawberry.ID | None
    value: int | None
    close_date: dt.date | None
    status: str


@strawberry.type
class ActivityType:
    id: strawberry.ID
    type: str
    status: str
    subject: str
    due_at: dt.datetime | None
    assigned_to_user_id: strawberry.ID | None
    lead_id: strawberry.ID | None
    contact_id: strawberry.ID | None
    customer_id: strawberry.ID | None
    deal_id: strawberry.ID | None


@strawberry.type
class NoteType:
    id: strawberry.ID
    body: str
    author_user_id: strawberry.ID | None
    lead_id: strawberry.ID | None
    contact_id: strawberry.ID | None
    customer_id: strawberry.ID | None
    deal_id: strawberry.ID | None
    created_at: dt.datetime


def to_customer_type(customer: models.Customer) -> CustomerType:
    return CustomerType(
        id=str(customer.id),
        name=customer.name,
        industry=customer.industry,
        website=customer.website,
        status=customer.status.value,
        owner_user_id=str(customer.owner_user_id) if customer.owner_user_id else None,
        created_at=customer.created_at,
    )


def to_lead_type(lead: models.Lead) -> LeadType:
    return LeadType(
        id=str(lead.id),
        full_name=lead.full_name,
        email=lead.email,
        phone=lead.phone,
        company=lead.company,
        budget=lead.budget,
        details=lead.details,
        source=lead.source,
        status=lead.status.value,
        score=lead.score,
        assigned_to_user_id=str(lead.assigned_to_user_id) if lead.assigned_to_user_id else None,
        customer_id=str(lead.customer_id) if lead.customer_id else None,
        created_at=lead.created_at,
    )


def to_pipeline_stage_type(stage: models.PipelineStage) -> PipelineStageType:
    return PipelineStageType(
        id=str(stage.id),
        name=stage.name,
        order=stage.order,
        probability=stage.probability,
    )


def to_deal_type(deal: models.Deal) -> DealType:
    return DealType(
        id=str(deal.id),
        name=deal.name,
        customer_id=str(deal.customer_id),
        stage_id=str(deal.stage_id) if deal.stage_id else None,
        value=deal.value,
        close_date=deal.close_date,
        status=deal.status.value,
    )


def to_activity_type(activity: models.Activity) -> ActivityType:
    return ActivityType(
        id=str(activity.id),
        type=activity.type.value,
        status=activity.status.value,
        subject=activity.subject,
        due_at=activity.due_at,
        assigned_to_user_id=str(activity.assigned_to_user_id) if activity.assigned_to_user_id else None,
        lead_id=str(activity.lead_id) if activity.lead_id else None,
        contact_id=str(activity.contact_id) if activity.contact_id else None,
        customer_id=str(activity.customer_id) if activity.customer_id else None,
        deal_id=str(activity.deal_id) if activity.deal_id else None,
    )


def to_note_type(note: models.Note) -> NoteType:
    return NoteType(
        id=str(note.id),
        body=note.body,
        author_user_id=str(note.author_user_id) if note.author_user_id else None,
        lead_id=str(note.lead_id) if note.lead_id else None,
        contact_id=str(note.contact_id) if note.contact_id else None,
        customer_id=str(note.customer_id) if note.customer_id else None,
        deal_id=str(note.deal_id) if note.deal_id else None,
        created_at=note.created_at,
    )
