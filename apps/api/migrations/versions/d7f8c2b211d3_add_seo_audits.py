"""add_seo_audits

Revision ID: d7f8c2b211d3
Revises: 197326810f81
Create Date: 2026-01-10 09:31:30.990752

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'd7f8c2b211d3'
down_revision = '197326810f81'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "seo_audits",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("email", sa.String(length=255)),
        sa.Column("score", sa.Integer()),
        sa.Column("findings_json", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_seo_audits_url", "seo_audits", ["url"])
    op.create_index("ix_seo_audits_email", "seo_audits", ["email"])


def downgrade() -> None:
    op.drop_index("ix_seo_audits_email", table_name="seo_audits")
    op.drop_index("ix_seo_audits_url", table_name="seo_audits")
    op.drop_table("seo_audits")
