"""add lead capture fields and newsletter signups

Revision ID: 0002_public_leads_newsletter
Revises: 0001_initial
Create Date: 2026-01-05
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "0002_public_leads_newsletter"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("leads", sa.Column("company", sa.String(length=255)))
    op.add_column("leads", sa.Column("budget", sa.String(length=120)))
    op.add_column("leads", sa.Column("details", sa.Text()))

    op.create_table(
        "newsletter_signups",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("lead_magnet", sa.String(length=255)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_newsletter_signups_email", "newsletter_signups", ["email"])


def downgrade() -> None:
    op.drop_index("ix_newsletter_signups_email", table_name="newsletter_signups")
    op.drop_table("newsletter_signups")
    op.drop_column("leads", "details")
    op.drop_column("leads", "budget")
    op.drop_column("leads", "company")
