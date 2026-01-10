"""add_email_automation

Revision ID: fe0ae519a216
Revises: 220646cbf9d4
Create Date: 2026-01-10 09:34:59.250715

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'fe0ae519a216'
down_revision = '220646cbf9d4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "email_campaigns",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), server_default="draft", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "email_sequences",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("campaign_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("step_number", sa.Integer(), nullable=False),
        sa.Column("delay_days", sa.Integer(), server_default="0", nullable=False),
        sa.Column("subject", sa.String(length=255), nullable=False),
        sa.Column("body", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["campaign_id"], ["email_campaigns.id"], ondelete="CASCADE"),
    )

    op.create_table(
        "email_subscribers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("status", sa.String(length=50), server_default="active", nullable=False),
        sa.Column("tags", sa.String(length=500)),
        sa.Column("subscribed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_email_subscribers_email", "email_subscribers", ["email"], unique=True)

    op.create_table(
        "email_sends",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("subscriber_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sequence_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True)),
        sa.Column("opened_at", sa.DateTime(timezone=True)),
        sa.Column("clicked_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["subscriber_id"], ["email_subscribers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["sequence_id"], ["email_sequences.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_email_sends_subscriber", "email_sends", ["subscriber_id"])
    op.create_index("ix_email_sends_sequence", "email_sends", ["sequence_id"])


def downgrade() -> None:
    op.drop_index("ix_email_sends_sequence", table_name="email_sends")
    op.drop_index("ix_email_sends_subscriber", table_name="email_sends")
    op.drop_table("email_sends")
    op.drop_index("ix_email_subscribers_email", table_name="email_subscribers")
    op.drop_table("email_subscribers")
    op.drop_table("email_sequences")
    op.drop_table("email_campaigns")
