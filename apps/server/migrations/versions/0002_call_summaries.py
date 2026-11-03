"""call summaries: Claude's summary of each call, kept with the call

Revision ID: 0002
Revises: 0001
Create Date: 2026-11-03 10:30:00.000000

The new column is covered by the app role's table grant and the row-level security policy on `calls`.
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("calls", sa.Column("summary", postgresql.JSONB(astext_type=sa.Text()), nullable=True))


def downgrade() -> None:
    op.drop_column("calls", "summary")
