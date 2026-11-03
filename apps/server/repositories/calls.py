"""Calls: saved by voice once a call has ended (voice.after_call), read by the dashboard (next)."""

import uuid
from typing import Any

from sqlalchemy import update

from core.db import Database, NumberRoute
from core.models import Call


async def save_call(db: Database, route: NumberRoute, call: Call) -> uuid.UUID:
    """Saves `call` under the organization, agent and number that the dialed number belongs to. Returns its ID."""
    call.organization_id, call.agent_id, call.phone_number_id = route.organization_id, route.agent_id, route.phone_number_id
    async with db.tenant(route.organization_id) as session:
        session.add(call)
        await session.flush()
    return call.id


async def save_summary(
    db: Database, organization_id: uuid.UUID, call_id: uuid.UUID, summary: dict[str, Any], outcome: str
) -> None:
    """Keeps Claude's summary with the call it summarizes, and the outcome it found."""
    async with db.tenant(organization_id) as session:
        await session.execute(update(Call).where(Call.id == call_id).values(summary=summary, outcome=outcome))
