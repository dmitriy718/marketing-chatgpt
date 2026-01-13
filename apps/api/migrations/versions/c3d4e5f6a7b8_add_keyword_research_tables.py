"""add_keyword_research_tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-01-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'c3d4e5f6a7b8'
down_revision = 'b2c3d4e5f6a7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "keyword_researches",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("seed_keyword", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), index=True),
        sa.Column("research_json", sa.Text()),
        sa.Column("total_keywords", sa.Integer()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_keyword_researches_seed_keyword", "keyword_researches", ["seed_keyword"])
    op.create_index("ix_keyword_researches_email", "keyword_researches", ["email"])

    op.create_table(
        "keywords",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("research_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("keyword", sa.String(length=255), nullable=False),
        sa.Column("search_volume", sa.Integer()),
        sa.Column("difficulty", sa.Integer()),
        sa.Column("cpc", sa.Float()),
        sa.Column("competition", sa.String(length=50)),
        sa.Column("intent", sa.String(length=50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["research_id"], ["keyword_researches.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_keywords_research_id", "keywords", ["research_id"])
    op.create_index("ix_keywords_keyword", "keywords", ["keyword"])


def downgrade() -> None:
    op.drop_index("ix_keywords_keyword", table_name="keywords")
    op.drop_index("ix_keywords_research_id", table_name="keywords")
    op.drop_table("keywords")
    op.drop_index("ix_keyword_researches_email", table_name="keyword_researches")
    op.drop_index("ix_keyword_researches_seed_keyword", table_name="keyword_researches")
    op.drop_table("keyword_researches")
