import uuid

import strawberry
from strawberry.schema.config import StrawberryConfig
from graphql.error import GraphQLError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from marketing_api.db import models
from marketing_api.graphql.inputs import (
    ActivityInput,
    CustomerInput,
    DealInput,
    LeadInput,
    NoteInput,
    PipelineStageInput,
)
from marketing_api.graphql.types import (
    ActivityType,
    CustomerType,
    DealType,
    LeadType,
    NoteType,
    PipelineStageType,
    ServiceSummary,
    to_activity_type,
    to_customer_type,
    to_deal_type,
    to_lead_type,
    to_note_type,
    to_pipeline_stage_type,
)


async def list_entities(session: AsyncSession, model):
    result = await session.execute(select(model))
    return result.scalars().all()


def parse_uuid(value: str | None, field: str) -> uuid.UUID | None:
    if not value:
        return None
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise GraphQLError(f"Invalid {field}.") from exc


def parse_enum(enum_cls, value: str | None, field: str):
    if value is None:
        return None
    try:
        return enum_cls(value)
    except ValueError as exc:
        raise GraphQLError(f"Invalid {field}.") from exc


def require_user(info) -> None:
    if not info.context.get("current_user"):
        raise GraphQLError("Authentication required.")


def require_role(info, allowed_roles: set[str]) -> None:
    user = info.context.get("current_user")
    if not user:
        raise GraphQLError("Authentication required.")
    user_roles = {role.name for role in getattr(user, "roles", [])}
    if not user_roles.intersection(allowed_roles):
        raise GraphQLError("Insufficient permissions.")


@strawberry.type
class Query:
    @strawberry.field
    def health(self) -> str:
        return "ok"

    @strawberry.field
    def services(self) -> list[ServiceSummary]:
        return [
            ServiceSummary(
                slug="lead-gen",
                name="Lead Generation",
                description="Predictable inbound pipelines.",
            ),
            ServiceSummary(
                slug="seo",
                name="SEO Growth",
                description="Technical SEO and content authority.",
            ),
        ]

    @strawberry.field
    async def leads(self, info) -> list[LeadType]:
        require_user(info)
        session: AsyncSession = info.context["session"]
        leads = await list_entities(session, models.Lead)
        return [to_lead_type(lead) for lead in leads]

    @strawberry.field
    async def customers(self, info) -> list[CustomerType]:
        require_user(info)
        session: AsyncSession = info.context["session"]
        customers = await list_entities(session, models.Customer)
        return [to_customer_type(customer) for customer in customers]

    @strawberry.field
    async def deals(self, info) -> list[DealType]:
        require_user(info)
        session: AsyncSession = info.context["session"]
        deals = await list_entities(session, models.Deal)
        return [to_deal_type(deal) for deal in deals]

    @strawberry.field
    async def activities(self, info) -> list[ActivityType]:
        require_user(info)
        session: AsyncSession = info.context["session"]
        activities = await list_entities(session, models.Activity)
        return [to_activity_type(activity) for activity in activities]

    @strawberry.field
    async def pipeline_stages(self, info) -> list[PipelineStageType]:
        require_user(info)
        session: AsyncSession = info.context["session"]
        stages = await list_entities(session, models.PipelineStage)
        return [to_pipeline_stage_type(stage) for stage in stages]

    @strawberry.field
    async def notes(self, info) -> list[NoteType]:
        require_user(info)
        session: AsyncSession = info.context["session"]
        notes = await list_entities(session, models.Note)
        return [to_note_type(note) for note in notes]


@strawberry.type
class Mutation:
    @strawberry.mutation
    async def create_lead(self, info, payload: LeadInput) -> LeadType:
        require_user(info)
        session: AsyncSession = info.context["session"]
        lead = models.Lead(
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
            company=payload.company,
            budget=payload.budget,
            details=payload.details,
            source=payload.source,
            score=payload.score,
            status=parse_enum(models.LeadStatus, payload.status, "lead status")
            or models.LeadStatus.new,
            assigned_to_user_id=parse_uuid(payload.assigned_to_user_id, "assigned_to_user_id"),
            customer_id=parse_uuid(payload.customer_id, "customer_id"),
        )
        session.add(lead)
        await session.commit()
        await session.refresh(lead)
        return to_lead_type(lead)

    @strawberry.mutation
    async def create_customer(self, info, payload: CustomerInput) -> CustomerType:
        require_user(info)
        session: AsyncSession = info.context["session"]
        customer = models.Customer(
            name=payload.name,
            industry=payload.industry,
            website=payload.website,
            status=(
                parse_enum(models.CustomerStatus, payload.status, "customer status")
                or models.CustomerStatus.prospect
            ),
            owner_user_id=parse_uuid(payload.owner_user_id, "owner_user_id"),
        )
        session.add(customer)
        await session.commit()
        await session.refresh(customer)
        return to_customer_type(customer)

    @strawberry.mutation
    async def create_deal(self, info, payload: DealInput) -> DealType:
        require_user(info)
        session: AsyncSession = info.context["session"]
        deal = models.Deal(
            name=payload.name,
            customer_id=parse_uuid(payload.customer_id, "customer_id"),
            stage_id=parse_uuid(payload.stage_id, "stage_id"),
            value=payload.value,
            close_date=payload.close_date,
            status=parse_enum(models.DealStatus, payload.status, "deal status")
            or models.DealStatus.open,
        )
        session.add(deal)
        await session.commit()
        await session.refresh(deal)
        return to_deal_type(deal)

    @strawberry.mutation
    async def create_activity(self, info, payload: ActivityInput) -> ActivityType:
        require_user(info)
        session: AsyncSession = info.context["session"]
        activity = models.Activity(
            type=parse_enum(models.ActivityType, payload.type, "activity type"),
            status=(
                parse_enum(models.ActivityStatus, payload.status, "activity status")
                or models.ActivityStatus.open
            ),
            subject=payload.subject,
            due_at=payload.due_at,
            assigned_to_user_id=parse_uuid(payload.assigned_to_user_id, "assigned_to_user_id"),
            lead_id=parse_uuid(payload.lead_id, "lead_id"),
            contact_id=parse_uuid(payload.contact_id, "contact_id"),
            customer_id=parse_uuid(payload.customer_id, "customer_id"),
            deal_id=parse_uuid(payload.deal_id, "deal_id"),
        )
        session.add(activity)
        await session.commit()
        await session.refresh(activity)
        return to_activity_type(activity)

    @strawberry.mutation
    async def create_note(self, info, payload: NoteInput) -> NoteType:
        require_user(info)
        session: AsyncSession = info.context["session"]
        note = models.Note(
            body=payload.body,
            author_user_id=parse_uuid(payload.author_user_id, "author_user_id"),
            lead_id=parse_uuid(payload.lead_id, "lead_id"),
            contact_id=parse_uuid(payload.contact_id, "contact_id"),
            customer_id=parse_uuid(payload.customer_id, "customer_id"),
            deal_id=parse_uuid(payload.deal_id, "deal_id"),
        )
        session.add(note)
        await session.commit()
        await session.refresh(note)
        return to_note_type(note)

    @strawberry.mutation
    async def create_pipeline_stage(self, info, payload: PipelineStageInput) -> PipelineStageType:
        require_role(info, {"admin", "manager"})
        session: AsyncSession = info.context["session"]
        stage = models.PipelineStage(
            name=payload.name,
            order=payload.order,
            probability=payload.probability,
        )
        session.add(stage)
        await session.commit()
        await session.refresh(stage)
        return to_pipeline_stage_type(stage)


schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    config=StrawberryConfig(auto_camel_case=False),
)
