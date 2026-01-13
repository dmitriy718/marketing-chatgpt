import enum
import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from marketing_api.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from marketing_api.db.stripe_base import StripeBase


class LeadStatus(str, enum.Enum):
    new = "new"
    qualified = "qualified"
    nurturing = "nurturing"
    converted = "converted"
    lost = "lost"


class ActivityStatus(str, enum.Enum):
    open = "open"
    completed = "completed"
    canceled = "canceled"


class ActivityType(str, enum.Enum):
    call = "call"
    email = "email"
    meeting = "meeting"
    task = "task"


class DealStatus(str, enum.Enum):
    open = "open"
    won = "won"
    lost = "lost"


class CustomerStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    prospect = "prospect"


class Role(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))


class Permission(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "permissions"

    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255))


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True
    )


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    roles = relationship("Role", secondary="user_roles", lazy="selectin")


class Customer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "customers"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    industry: Mapped[str | None] = mapped_column(String(120))
    website: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[CustomerStatus] = mapped_column(
        Enum(CustomerStatus), default=CustomerStatus.prospect, nullable=False
    )
    owner_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )

    contacts = relationship("Contact", back_populates="customer", lazy="selectin")
    deals = relationship("Deal", back_populates="customer", lazy="selectin")


class Contact(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "contacts"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE")
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(80))
    title: Mapped[str | None] = mapped_column(String(120))

    customer = relationship("Customer", back_populates="contacts", lazy="selectin")


class Lead(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "leads"

    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(80))
    company: Mapped[str | None] = mapped_column(String(255))
    budget: Mapped[str | None] = mapped_column(String(120))
    details: Mapped[str | None] = mapped_column(Text)
    source: Mapped[str | None] = mapped_column(String(120))
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus), default=LeadStatus.new, nullable=False
    )
    score: Mapped[int | None] = mapped_column(default=0)
    assigned_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL")
    )


class PipelineStage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "pipeline_stages"

    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    order: Mapped[int] = mapped_column(nullable=False)
    probability: Mapped[int] = mapped_column(default=0, nullable=False)

    deals = relationship("Deal", back_populates="stage", lazy="selectin")


class Deal(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "deals"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="CASCADE")
    )
    stage_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("pipeline_stages.id", ondelete="SET NULL")
    )
    value: Mapped[int | None] = mapped_column(default=0)
    close_date: Mapped[date | None] = mapped_column(Date)
    status: Mapped[DealStatus] = mapped_column(
        Enum(DealStatus), default=DealStatus.open, nullable=False
    )

    customer = relationship("Customer", back_populates="deals", lazy="selectin")
    stage = relationship("PipelineStage", back_populates="deals", lazy="selectin")


class Activity(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "activities"

    type: Mapped[ActivityType] = mapped_column(Enum(ActivityType), nullable=False)
    status: Mapped[ActivityStatus] = mapped_column(
        Enum(ActivityStatus), default=ActivityStatus.open, nullable=False
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    assigned_to_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL")
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL")
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL")
    )
    deal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("deals.id", ondelete="SET NULL")
    )


class Note(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "notes"

    body: Mapped[str] = mapped_column(Text, nullable=False)
    author_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL")
    )
    lead_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("leads.id", ondelete="SET NULL")
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("contacts.id", ondelete="SET NULL")
    )
    customer_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customers.id", ondelete="SET NULL")
    )
    deal_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("deals.id", ondelete="SET NULL")
    )


class NewsletterSignup(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "newsletter_signups"

    email: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    lead_magnet: Mapped[str | None] = mapped_column(String(255))


class BugReport(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "bug_reports"

    message: Mapped[str] = mapped_column(Text, nullable=False)
    stack: Mapped[str | None] = mapped_column(Text)
    digest: Mapped[str | None] = mapped_column(String(120))
    url: Mapped[str | None] = mapped_column(String(500))
    user_agent: Mapped[str | None] = mapped_column(String(255))
    referrer: Mapped[str | None] = mapped_column(String(500))
    context: Mapped[str | None] = mapped_column(Text)


class StripeWebhookEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "stripe_webhook_events"

    event_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    event_type: Mapped[str] = mapped_column(String(255), nullable=False)
    livemode: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    event_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    data_object_id: Mapped[str | None] = mapped_column(String(255))
    payload: Mapped[str] = mapped_column(Text, nullable=False)


class StripeTransaction(StripeBase, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "stripe_transactions"
    __table_args__ = (
        UniqueConstraint("stripe_object_id", "object_type", name="uq_stripe_transactions_object"),
    )

    stripe_object_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    object_type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str | None] = mapped_column(String(120))
    amount: Mapped[int | None] = mapped_column()
    currency: Mapped[str | None] = mapped_column(String(12))
    customer_id: Mapped[str | None] = mapped_column(String(120))
    customer_email: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(String(255))
    metadata_json: Mapped[str | None] = mapped_column(Text)
    event_id: Mapped[str | None] = mapped_column(String(255))
    event_type: Mapped[str | None] = mapped_column(String(255))
    livemode: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    event_created_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ChatMessage(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "chat_messages"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text, nullable=False)
    page_url: Mapped[str | None] = mapped_column(String(500))
    user_agent: Mapped[str | None] = mapped_column(String(255))
    referrer: Mapped[str | None] = mapped_column(String(500))
    is_ai_response: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    chat_session_id: Mapped[str | None] = mapped_column(String(255), index=True)
    ai_response_text: Mapped[str | None] = mapped_column(Text)


class SeoAudit(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "seo_audits"

    url: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    score: Mapped[int | None] = mapped_column()
    findings_json: Mapped[str | None] = mapped_column(Text)

class CompetitorComparison(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "competitor_comparisons"

    user_url: Mapped[str] = mapped_column(String(500), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    comparison_json: Mapped[str] = mapped_column(Text, nullable=False)


class GeneratedContent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "generated_content"

    email: Mapped[str | None] = mapped_column(String(255), index=True)
    content_type: Mapped[str] = mapped_column(String(50), nullable=False)
    prompt: Mapped[str] = mapped_column(Text, nullable=False)
    generated_text: Mapped[str] = mapped_column(Text, nullable=False)


class EmailCampaign(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_campaigns"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[str] = mapped_column(String(50), server_default="draft", nullable=False)


class EmailSequence(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_sequences"

    campaign_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("email_campaigns.id", ondelete="CASCADE"), nullable=False)
    step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    delay_days: Mapped[int] = mapped_column(Integer, server_default="0", nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)


class EmailSubscriber(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_subscribers"

    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    status: Mapped[str] = mapped_column(String(50), server_default="active", nullable=False)
    tags: Mapped[str | None] = mapped_column(String(500))
    subscribed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class EmailSend(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "email_sends"

    subscriber_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("email_subscribers.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("email_sequences.id", ondelete="CASCADE"), nullable=False, index=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    opened_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    clicked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


class ConsultationBooking(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "consultation_bookings"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str | None] = mapped_column(String(50))
    company: Mapped[str | None] = mapped_column(String(255))
    scheduled_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)
    duration_minutes: Mapped[int] = mapped_column(Integer, server_default="30", nullable=False)
    status: Mapped[str] = mapped_column(String(50), server_default="pending", nullable=False)
    notes: Mapped[str | None] = mapped_column(Text())


class BacklinkAnalysis(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "backlink_analyses"

    url: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    status: Mapped[str] = mapped_column(String(50), server_default="pending", nullable=False)
    analysis_json: Mapped[str | None] = mapped_column(Text)
    quality_score: Mapped[int | None] = mapped_column(Integer)
    total_backlinks: Mapped[int | None] = mapped_column(Integer)
    referring_domains: Mapped[int | None] = mapped_column(Integer)


class Backlink(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "backlinks"

    analysis_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("backlink_analyses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    source_url: Mapped[str] = mapped_column(String(500), nullable=False)
    target_url: Mapped[str] = mapped_column(String(500), nullable=False)
    anchor_text: Mapped[str | None] = mapped_column(String(500))
    domain_authority: Mapped[int | None] = mapped_column(Integer)
    link_type: Mapped[str | None] = mapped_column(String(50))  # dofollow, nofollow, etc.


class ABTest(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "ab_tests"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(50), server_default="draft", nullable=False)  # draft, active, paused, completed
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    target_url: Mapped[str | None] = mapped_column(String(500))
    conversion_event: Mapped[str | None] = mapped_column(String(255))
    traffic_split: Mapped[str | None] = mapped_column(String(50))  # JSON: {"control": 50, "variant": 50}


class TestVariant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "test_variants"

    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ab_tests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    variant_key: Mapped[str] = mapped_column(String(50), nullable=False)  # control, variant_a, etc.
    content_json: Mapped[str] = mapped_column(Text, nullable=False)  # JSON with variant content
    weight: Mapped[int] = mapped_column(Integer, server_default="50", nullable=False)  # Traffic percentage


class TestAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "test_assignments"

    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ab_tests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("test_variants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_id: Mapped[str | None] = mapped_column(String(255), index=True)  # Can be user ID or session ID
    session_id: Mapped[str | None] = mapped_column(String(255), index=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class TestConversion(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "test_conversions"

    test_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("ab_tests.id", ondelete="CASCADE"), nullable=False, index=True
    )
    variant_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("test_variants.id", ondelete="CASCADE"), nullable=False, index=True
    )
    assignment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("test_assignments.id", ondelete="SET NULL"), index=True
    )
    user_id: Mapped[str | None] = mapped_column(String(255), index=True)
    event_name: Mapped[str] = mapped_column(String(255), nullable=False)
    converted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class KeywordResearch(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "keyword_researches"

    seed_keyword: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    research_json: Mapped[str | None] = mapped_column(Text)  # JSON with keyword data
    total_keywords: Mapped[int | None] = mapped_column(Integer)


class Keyword(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "keywords"

    research_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("keyword_researches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    keyword: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    search_volume: Mapped[int | None] = mapped_column(Integer)
    difficulty: Mapped[int | None] = mapped_column(Integer)  # 0-100
    cpc: Mapped[float | None] = mapped_column()  # Cost per click
    competition: Mapped[str | None] = mapped_column(String(50))  # low, medium, high
    intent: Mapped[str | None] = mapped_column(String(50))  # informational, commercial, transactional
