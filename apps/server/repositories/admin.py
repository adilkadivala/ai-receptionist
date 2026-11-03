"""The admin pages' reads: every customer's data in one place, for the founders. Read only, apart from the audit log.

Across organizations, only through the SECURITY DEFINER functions of migration 0003, in `Database.platform()`: the
customer list and the call totals, which hold names, numbers and counts but no calls. One organization's agents,
numbers and calls are read through `Database.tenant()` like any other read, so a transcript never crosses
organizations, and every transcript the admin opens is written to `audit_log`.
"""

import uuid
from typing import Any

from psycopg.errors import InvalidParameterValue
from sqlalchemy import func, literal_column, select, text
from sqlalchemy.exc import DBAPIError

from core.db import Database
from core.models import Agent, AuditEntry, Call, Organization, PhoneNumber

# Until there's a login, the admin pages answer only on this computer (api.routes.admin), so that's who read it.
ADMIN_ON_THIS_COMPUTER = "admin on this computer"
TRANSCRIPT_VIEWED = "call.transcript_viewed"

# `calls.summary` comes with migration 0002 (calls saved with Claude's summary). Read through to_jsonb, a database
# without the column gives None instead of an error. Once 0002 is merged, this can become `Call.summary`.
SUMMARY = literal_column("to_jsonb(calls) -> 'summary'")

IN_TIME_ZONE = text("SELECT now() AT TIME ZONE :time_zone")

CALL_COLUMNS = (
    Call.id,
    Call.agent_id,
    Call.from_number,
    Call.to_number,
    Call.language,
    Call.started_at,
    Call.ended_at,
    Call.duration_seconds,
    Call.outcome,
)


async def list_organizations(db: Database) -> list[dict[str, Any]]:
    """Every organization, newest first, with its numbers, agents and call totals."""
    async with db.platform() as session:
        rows = (await session.execute(text("SELECT * FROM admin_organizations()"))).mappings().all()
    return [dict(row) for row in rows]


class UnknownTimeZone(ValueError):
    pass


async def call_totals(db: Database, time_zone: str) -> tuple[int, list[dict[str, Any]]]:
    """How many organizations there are, and calls across all of them per outcome: today, this week and in all.
    Raises UnknownTimeZone for a time zone Postgres doesn't know."""
    async with db.platform() as session:
        # Postgres decides what "today" is, so it decides which names are time zones: it knows old names such as
        # Asia/Calcutta, which browsers still report and which the host's tz database may lack.
        try:
            await session.execute(IN_TIME_ZONE, {"time_zone": time_zone})
        except DBAPIError as error:
            if isinstance(error.orig, InvalidParameterValue):
                raise UnknownTimeZone(time_zone) from error
            raise
        organizations = (await session.execute(text("SELECT count(*) FROM admin_organizations()"))).scalar_one()
        rows = (await session.execute(text("SELECT * FROM admin_call_totals(:time_zone)"), {"time_zone": time_zone})).mappings()
        outcomes = [dict(row) for row in rows.all()]
    return organizations, outcomes


async def get_organization(db: Database, organization_id: uuid.UUID) -> dict[str, Any] | None:
    """One organization with its numbers, agents and call totals, or None if there's no such organization."""
    async with db.tenant(organization_id) as session:
        organization = await session.get(Organization, organization_id)
        if organization is None:
            return None
        numbers = (await session.execute(select(PhoneNumber).order_by(PhoneNumber.e164))).scalars().all()
        agents = (await session.execute(select(Agent).order_by(Agent.created_at, Agent.name))).scalars().all()
        totals = select(func.count(), func.coalesce(func.sum(Call.duration_seconds), 0), func.max(Call.started_at))
        calls, call_seconds, last_call_at = (await session.execute(totals)).one()
    return {
        **{column: getattr(organization, column) for column in ("id", "name", "plan", "region", "hipaa_mode", "created_at")},
        "phone_numbers": numbers,
        "agents": agents,
        "calls": calls,
        "call_seconds": call_seconds,
        "last_call_at": last_call_at,
    }


async def list_calls(db: Database, organization_id: uuid.UUID, page: int, page_size: int) -> dict[str, Any] | None:
    """One page of an organization's calls, newest first, or None if there's no such organization."""
    async with db.tenant(organization_id) as session:
        if await session.get(Organization, organization_id) is None:
            return None
        total = (await session.execute(select(func.count()).select_from(Call))).scalar_one()
        rows = await session.execute(
            select(*CALL_COLUMNS, SUMMARY.op("->>")("headline").label("headline"))
            .order_by(Call.started_at.desc(), Call.id)
            .limit(page_size)
            .offset((page - 1) * page_size)
        )
        items = [dict(row) for row in rows.mappings().all()]
    return {"items": items, "total": total, "page": page, "page_size": page_size}


async def get_call(db: Database, organization_id: uuid.UUID, call_id: uuid.UUID) -> dict[str, Any] | None:
    """One call with its transcript and summary, or None if this organization has no such call. Opening it is audited."""
    query = (
        select(
            *CALL_COLUMNS,
            Call.phone_number_id,
            Call.cost_usd,
            Call.transcript,
            SUMMARY.label("summary"),
            Agent.name.label("agent_name"),
        )
        .outerjoin(Agent, Agent.id == Call.agent_id)
        .where(Call.id == call_id)
    )
    async with db.tenant(organization_id) as session:
        row = (await session.execute(query)).mappings().first()
        if row is None:
            return None
        session.add(
            AuditEntry(organization_id=organization_id, actor=ADMIN_ON_THIS_COMPUTER, action=TRANSCRIPT_VIEWED, target_id=call_id)
        )
    return {**row, "organization_id": organization_id}
