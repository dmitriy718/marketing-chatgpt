"""add_competitor_comparisons

Revision ID: e42f0e3a3206
Revises: fe0ae519a216
Create Date: 2026-01-10 10:18:04.069892

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'e42f0e3a3206'
down_revision = 'fe0ae519a216'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "competitor_comparisons",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_url", sa.String(length=500), nullable=False),
        sa.Column("email", sa.String(length=255), index=True),
        sa.Column("comparison_json", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("competitor_comparisons")
