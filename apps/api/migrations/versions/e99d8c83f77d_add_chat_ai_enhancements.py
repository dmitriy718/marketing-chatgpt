"""add_chat_ai_enhancements

Revision ID: e99d8c83f77d
Revises: d7f8c2b211d3
Create Date: 2026-01-10 09:32:47.720692

"""
from alembic import op
import sqlalchemy as sa


revision = 'e99d8c83f77d'
down_revision = 'd7f8c2b211d3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("chat_messages", sa.Column("is_ai_response", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("chat_messages", sa.Column("chat_session_id", sa.String(length=255)))
    op.add_column("chat_messages", sa.Column("ai_response_text", sa.Text()))
    op.create_index("ix_chat_messages_session", "chat_messages", ["chat_session_id"])


def downgrade() -> None:
    op.drop_index("ix_chat_messages_session", table_name="chat_messages")
    op.drop_column("chat_messages", "ai_response_text")
    op.drop_column("chat_messages", "chat_session_id")
    op.drop_column("chat_messages", "is_ai_response")
