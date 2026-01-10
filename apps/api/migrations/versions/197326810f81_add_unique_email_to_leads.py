"""add_unique_email_to_leads

Revision ID: 197326810f81
Revises: 0005_chat_messages
Create Date: 2026-01-10 09:17:58.316121

"""
from alembic import op
import sqlalchemy as sa


revision = '197326810f81'
down_revision = '0005_chat_messages'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create a partial unique index on email where email is not null
    # This prevents duplicate non-null emails while allowing multiple null emails
    op.execute(
        """
        CREATE UNIQUE INDEX IF NOT EXISTS uq_leads_email_not_null 
        ON leads (email) 
        WHERE email IS NOT NULL
        """
    )


def downgrade() -> None:
    op.drop_index("uq_leads_email_not_null", table_name="leads")
