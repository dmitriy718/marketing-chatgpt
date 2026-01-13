"""add_backlink_analyzer_tables

Revision ID: a1b2c3d4e5f6
Revises: 038af67121a3
Create Date: 2026-01-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'a1b2c3d4e5f6'
down_revision = '038af67121a3'  # Update this to the latest migration
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "backlink_analyses",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("url", sa.String(length=500), nullable=False),
        sa.Column("email", sa.String(length=255), index=True),
        sa.Column("status", sa.String(length=50), server_default="pending", nullable=False),
        sa.Column("analysis_json", sa.Text()),
        sa.Column("quality_score", sa.Integer()),
        sa.Column("total_backlinks", sa.Integer()),
        sa.Column("referring_domains", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_backlink_analyses_url", "backlink_analyses", ["url"])
    op.create_index("ix_backlink_analyses_email", "backlink_analyses", ["email"])

    op.create_table(
        "backlinks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("analysis_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_url", sa.String(length=500), nullable=False),
        sa.Column("target_url", sa.String(length=500), nullable=False),
        sa.Column("anchor_text", sa.String(length=500)),
        sa.Column("domain_authority", sa.Integer()),
        sa.Column("link_type", sa.String(length=50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["analysis_id"], ["backlink_analyses.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_backlinks_analysis_id", "backlinks", ["analysis_id"])


def downgrade() -> None:
    op.drop_index("ix_backlinks_analysis_id", table_name="backlinks")
    op.drop_table("backlinks")
    op.drop_index("ix_backlink_analyses_email", table_name="backlink_analyses")
    op.drop_index("ix_backlink_analyses_url", table_name="backlink_analyses")
    op.drop_table("backlink_analyses")
