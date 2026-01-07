"""add bug reports

Revision ID: 0003_bug_reports
Revises: 0002_public_leads_newsletter
Create Date: 2026-01-07
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0003_bug_reports"
down_revision = "0002_public_leads_newsletter"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "bug_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("stack", sa.Text()),
        sa.Column("digest", sa.String(length=120)),
        sa.Column("url", sa.String(length=500)),
        sa.Column("user_agent", sa.String(length=255)),
        sa.Column("referrer", sa.String(length=500)),
        sa.Column("context", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("bug_reports")
