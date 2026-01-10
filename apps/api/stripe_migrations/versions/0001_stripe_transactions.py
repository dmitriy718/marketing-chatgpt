"""add stripe transactions

Revision ID: 0001_stripe_transactions
Revises:
Create Date: 2026-01-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0001_stripe_transactions"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "stripe_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("stripe_object_id", sa.String(length=255), nullable=False),
        sa.Column("object_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=120)),
        sa.Column("amount", sa.Integer()),
        sa.Column("currency", sa.String(length=12)),
        sa.Column("customer_id", sa.String(length=120)),
        sa.Column("customer_email", sa.String(length=255)),
        sa.Column("description", sa.String(length=255)),
        sa.Column("metadata_json", sa.Text()),
        sa.Column("event_id", sa.String(length=255)),
        sa.Column("event_type", sa.String(length=255)),
        sa.Column("livemode", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("event_created_at", sa.DateTime(timezone=True)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.UniqueConstraint(
            "stripe_object_id",
            "object_type",
            name="uq_stripe_transactions_object",
        ),
    )
    op.create_index(
        "ix_stripe_transactions_stripe_object_id",
        "stripe_transactions",
        ["stripe_object_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_stripe_transactions_stripe_object_id", table_name="stripe_transactions")
    op.drop_table("stripe_transactions")
