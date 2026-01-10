"""add_generated_content

Revision ID: 220646cbf9d4
Revises: e99d8c83f77d
Create Date: 2026-01-10 09:33:57.621781

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '220646cbf9d4'
down_revision = 'e99d8c83f77d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "generated_content",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255)),
        sa.Column("content_type", sa.String(length=50), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column("generated_text", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_generated_content_email", "generated_content", ["email"])


def downgrade() -> None:
    op.drop_index("ix_generated_content_email", table_name="generated_content")
    op.drop_table("generated_content")
