import datetime as dt

import strawberry


@strawberry.input
class LeadInput:
    full_name: str
    email: str | None = None
    phone: str | None = None
    company: str | None = None
    budget: str | None = None
    details: str | None = None
    source: str | None = None
    score: int | None = 0
    status: str | None = None
    assigned_to_user_id: str | None = None
    customer_id: str | None = None


@strawberry.input
class CustomerInput:
    name: str
    industry: str | None = None
    website: str | None = None
    status: str | None = None
    owner_user_id: str | None = None


@strawberry.input
class DealInput:
    name: str
    customer_id: str
    stage_id: str | None = None
    value: int | None = 0
    close_date: dt.date | None = None
    status: str | None = None


@strawberry.input
class ActivityInput:
    type: str
    subject: str
    status: str | None = None
    due_at: dt.datetime | None = None
    assigned_to_user_id: str | None = None
    lead_id: str | None = None
    contact_id: str | None = None
    customer_id: str | None = None
    deal_id: str | None = None


@strawberry.input
class NoteInput:
    body: str
    author_user_id: str | None = None
    lead_id: str | None = None
    contact_id: str | None = None
    customer_id: str | None = None
    deal_id: str | None = None


@strawberry.input
class PipelineStageInput:
    name: str
    order: int
    probability: int
