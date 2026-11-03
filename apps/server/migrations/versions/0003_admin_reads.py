"""admin reads: the founders' view across organizations, and an append-only audit log

Revision ID: 0003
Revises: 0001
Create Date: 2026-11-03 12:00:00.000000

The admin pages list every organization and count calls across all of them. The app role still sees one organization
per transaction: these two reads are narrow SECURITY DEFINER functions, built like `resolve_phone_number`, that return
only names, plans, numbers, agent names and counts. Transcripts never cross organizations: the admin reads one
organization's calls through `Database.tenant()`, like any other read, and each transcript view is written to
`audit_log`, which the app role can add to and read but never change.

Before merging: if `main` has gained 0002, set `down_revision` to "0002".
"""

import re
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

from core.config import get_settings

revision: str = "0003"
down_revision: str | Sequence[str] | None = "0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    role = app_role()

    op.create_table(
        "audit_log",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("organization_id", sa.Uuid(), nullable=False),
        sa.Column("actor", sa.Text(), nullable=False),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("target_id", sa.Uuid(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["organization_id"], ["organizations.id"], name=op.f("fk_audit_log_organization_id"), ondelete="CASCADE"
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_audit_log")),
    )
    op.execute("ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY")
    op.execute("""
        CREATE POLICY tenant_isolation ON audit_log
        USING (organization_id = current_organization_id())
        WITH CHECK (organization_id = current_organization_id())
    """)
    # Append-only: no UPDATE or DELETE, so a row can't be changed or removed once written.
    op.execute(f"GRANT SELECT, INSERT ON audit_log TO {role}")

    # Every organization with its numbers, agent names and call totals: the admin's customer list.
    op.execute("""
        CREATE FUNCTION admin_organizations()
        RETURNS TABLE (
            id uuid, name text, plan text, region text, hipaa_mode boolean, created_at timestamptz,
            phone_numbers jsonb, agents jsonb, calls bigint, call_seconds bigint, last_call_at timestamptz
        )
        LANGUAGE sql STABLE SECURITY DEFINER
        SET search_path = public, pg_temp
        AS $$
            SELECT o.id, o.name, o.plan, o.region, o.hipaa_mode, o.created_at,
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('id', p.id, 'e164', p.e164, 'agent_id', p.agent_id) ORDER BY p.e164)
                    FROM phone_numbers p WHERE p.organization_id = o.id
                ), '[]'),
                COALESCE((
                    SELECT jsonb_agg(jsonb_build_object('id', a.id, 'name', a.name) ORDER BY a.created_at, a.name)
                    FROM agents a WHERE a.organization_id = o.id
                ), '[]'),
                c.calls, c.call_seconds, c.last_call_at
            FROM organizations o
            CROSS JOIN LATERAL (
                SELECT count(*) AS calls, COALESCE(sum(k.duration_seconds), 0)::bigint AS call_seconds,
                    max(k.started_at) AS last_call_at
                FROM calls k WHERE k.organization_id = o.id
            ) c
            ORDER BY o.created_at DESC, o.name
        $$
    """)

    # Calls across every organization, one row per outcome (NULL: not set yet). "Today" and "this week" (from Monday)
    # are in the viewer's time zone.
    op.execute("""
        CREATE FUNCTION admin_call_totals(time_zone text)
        RETURNS TABLE (
            outcome text, calls_today bigint, calls_this_week bigint, calls bigint,
            call_seconds_this_week bigint, call_seconds bigint
        )
        LANGUAGE sql STABLE SECURITY DEFINER
        SET search_path = public, pg_temp
        AS $$
            WITH since AS (
                SELECT date_trunc('day', now() AT TIME ZONE time_zone) AT TIME ZONE time_zone AS today,
                    date_trunc('week', now() AT TIME ZONE time_zone) AT TIME ZONE time_zone AS week
            )
            SELECT k.outcome,
                count(*) FILTER (WHERE k.started_at >= since.today),
                count(*) FILTER (WHERE k.started_at >= since.week),
                count(*),
                COALESCE(sum(k.duration_seconds) FILTER (WHERE k.started_at >= since.week), 0)::bigint,
                COALESCE(sum(k.duration_seconds), 0)::bigint
            FROM calls k, since
            GROUP BY k.outcome
        $$
    """)

    for function in ("admin_organizations()", "admin_call_totals(text)"):
        op.execute(f"REVOKE ALL ON FUNCTION {function} FROM PUBLIC")
        op.execute(f"GRANT EXECUTE ON FUNCTION {function} TO {role}")


def app_role() -> str:
    # The same check as 0001's: the role name goes into SQL.
    role = get_settings().db_app_role
    if not re.fullmatch(r"[a-z_][a-z0-9_]*", role):
        raise ValueError(f"db_app_role must be a plain lowercase identifier, got {role!r}")
    return role


def downgrade() -> None:
    op.execute("DROP FUNCTION admin_call_totals(text)")
    op.execute("DROP FUNCTION admin_organizations()")
    # Its policy and grants go with it.
    op.drop_table("audit_log")
