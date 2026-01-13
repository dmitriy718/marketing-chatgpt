"""add_ab_testing_tables

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-01-12 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = 'b2c3d4e5f6a7'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ab_tests",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("status", sa.String(length=50), server_default="draft", nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True)),
        sa.Column("end_date", sa.DateTime(timezone=True)),
        sa.Column("target_url", sa.String(length=500)),
        sa.Column("conversion_event", sa.String(length=255)),
        sa.Column("traffic_split", sa.String(length=50)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.create_table(
        "test_variants",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("test_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("variant_key", sa.String(length=50), nullable=False),
        sa.Column("content_json", sa.Text(), nullable=False),
        sa.Column("weight", sa.Integer(), server_default="50", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["test_id"], ["ab_tests.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_test_variants_test_id", "test_variants", ["test_id"])

    op.create_table(
        "test_assignments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("test_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("variant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", sa.String(length=255), index=True),
        sa.Column("session_id", sa.String(length=255), index=True),
        sa.Column("assigned_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["test_id"], ["ab_tests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["variant_id"], ["test_variants.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_test_assignments_test_id", "test_assignments", ["test_id"])
    op.create_index("ix_test_assignments_variant_id", "test_assignments", ["variant_id"])
    op.create_index("ix_test_assignments_user_id", "test_assignments", ["user_id"])
    op.create_index("ix_test_assignments_session_id", "test_assignments", ["session_id"])

    op.create_table(
        "test_conversions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("test_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("variant_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("assignment_id", postgresql.UUID(as_uuid=True), index=True),
        sa.Column("user_id", sa.String(length=255), index=True),
        sa.Column("event_name", sa.String(length=255), nullable=False),
        sa.Column("converted_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["test_id"], ["ab_tests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["variant_id"], ["test_variants.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["assignment_id"], ["test_assignments.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_test_conversions_test_id", "test_conversions", ["test_id"])
    op.create_index("ix_test_conversions_variant_id", "test_conversions", ["variant_id"])
    op.create_index("ix_test_conversions_assignment_id", "test_conversions", ["assignment_id"])
    op.create_index("ix_test_conversions_user_id", "test_conversions", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_test_conversions_user_id", table_name="test_conversions")
    op.drop_index("ix_test_conversions_assignment_id", table_name="test_conversions")
    op.drop_index("ix_test_conversions_variant_id", table_name="test_conversions")
    op.drop_index("ix_test_conversions_test_id", table_name="test_conversions")
    op.drop_table("test_conversions")
    op.drop_index("ix_test_assignments_session_id", table_name="test_assignments")
    op.drop_index("ix_test_assignments_user_id", table_name="test_assignments")
    op.drop_index("ix_test_assignments_variant_id", table_name="test_assignments")
    op.drop_index("ix_test_assignments_test_id", table_name="test_assignments")
    op.drop_table("test_assignments")
    op.drop_index("ix_test_variants_test_id", table_name="test_variants")
    op.drop_table("test_variants")
    op.drop_table("ab_tests")
