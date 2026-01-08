"""add chat messages

Revision ID: 0005_chat_messages
Revises: 0004_stripe_webhook_events
Create Date: 2026-01-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0005_chat_messages"
down_revision = "0004_stripe_webhook_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255)),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("page_url", sa.String(length=500)),
        sa.Column("user_agent", sa.String(length=255)),
        sa.Column("referrer", sa.String(length=500)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("chat_messages")
