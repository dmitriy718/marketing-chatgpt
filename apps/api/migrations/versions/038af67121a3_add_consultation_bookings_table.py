"""add_consultation_bookings_table

Revision ID: 038af67121a3
Revises: 5b5f336f4479
Create Date: 2026-01-11 15:35:35.273333

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = '038af67121a3'
down_revision = '5b5f336f4479'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "consultation_bookings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=50)),
        sa.Column("company", sa.String(length=255)),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("duration_minutes", sa.Integer(), server_default="30", nullable=False),
        sa.Column("status", sa.String(length=50), server_default="pending", nullable=False),
        sa.Column("notes", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )
    op.create_index("ix_consultation_bookings_email", "consultation_bookings", ["email"])
    op.create_index("ix_consultation_bookings_scheduled_at", "consultation_bookings", ["scheduled_at"])


def downgrade() -> None:
    op.drop_index("ix_consultation_bookings_scheduled_at", table_name="consultation_bookings")
    op.drop_index("ix_consultation_bookings_email", table_name="consultation_bookings")
    op.drop_table("consultation_bookings")
