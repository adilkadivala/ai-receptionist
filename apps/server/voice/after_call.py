"""Once a call has ended: save it, summarize it, keep the summary with it, and tell the owner.

voice.call.converse starts this in the background when a call's pipeline has finished, so it never delays or breaks a
call. Each step stands on its own: a call the database can't take still reaches the owner, and one Claude can't
summarize is still saved, with its transcript, and emailed.

A call is saved under the business that owns the number dialed (`resolve_phone_number`); browser test calls count as
calls to BUSINESS_NUMBER. `uv run python -m scripts.add_business` puts the business and its number in the database.

docs/architecture.md plans the summary and the owner's messages as the worker's `summarize_call` job, queued with the
saved call, where they'd survive a restart and be retried. Until the worker exists they run here, once.
"""

import asyncio
import uuid
from dataclasses import dataclass
from datetime import datetime

from loguru import logger

from core.config import Settings
from core.db import Database, get_database
from core.models import Call
from repositories.calls import save_call, save_summary
from voice.summary import CALLER, Turn, caller_spoke, notify_owner, summarize_call

# The summary's outcome in the calls table's terms (core.models.CALL_OUTCOMES).
OUTCOMES = {
    "callback": "message",
    "booking request": "message",  # the receptionist can't book, so the team must call back
    "question answered": "answered",
    "spam": "spam",
    "other": "answered",
}


@dataclass(frozen=True)
class EndedCall:
    turns: list[Turn]
    started_at: datetime
    ended_at: datetime
    to_number: str | None  # the number dialed, which decides whose call it is
    from_number: str | None = None  # the caller ID, when the phone network gave one
    provider_call_id: str | None = None  # Telnyx's call_control_id
    language: str | None = None  # the language the caller spoke last
    transferred_to: str | None = None  # TRANSFER_NUMBER, when the receptionist put the caller through (voice.transfer)


def outcome(call: EndedCall, summary_outcome: str | None) -> str | None:
    """The calls-table outcome: "transfer" for a call put through to the team, whatever the summary says; then
    "abandoned" when the caller said nothing; otherwise the summary's outcome, or None until there is one."""
    if call.transferred_to:
        return "transfer"
    if not caller_spoke(call.turns):
        return "abandoned"
    return OUTCOMES[summary_outcome] if summary_outcome else None


def call_row(call: EndedCall) -> Call:
    """The calls-table row for `call`. Its outcome is known now for a call put through or one where the caller said
    nothing; otherwise it comes with the summary."""
    return Call(
        provider_call_id=call.provider_call_id,
        from_number=call.from_number,
        to_number=call.to_number,
        language=call.language,
        started_at=call.started_at,
        ended_at=call.ended_at,
        duration_seconds=round((call.ended_at - call.started_at).total_seconds()),
        outcome=outcome(call, None),
        transcript=[{"role": "caller" if who == CALLER else "ai", "text": said} for who, said in call.turns],
    )


async def after_call(call: EndedCall, settings: Settings, *, label: str, db: Database | None = None) -> None:
    """Saves the call, then summarizes it, keeps the summary with it and sends it to the owner. Never raises: every
    failure is logged."""
    db = db or get_database()
    saved = await _save(call, db, label)
    summary = await summarize_call(call.turns, settings, label=label)
    if saved and summary:
        organization_id, call_id = saved
        try:
            await save_summary(db, organization_id, call_id, summary.model_dump(), outcome(call, summary.outcome))
        except Exception:
            logger.exception(f"{label}: couldn't save the summary with the call")
    await notify_owner(summary, call.turns, settings, label=label, caller_id=call.from_number, put_through_to=call.transferred_to)


async def _save(call: EndedCall, db: Database, label: str) -> tuple[uuid.UUID, uuid.UUID] | None:
    """Saves the call. Returns its organization's ID and its own, or None when it wasn't saved."""
    if not call.to_number:
        logger.info(f"{label}: not saved; set BUSINESS_NUMBER to save browser test calls")
        return None
    try:
        route = await db.resolve_number(call.to_number)
        if route is None:
            logger.warning(
                f"{label}: not saved; no business has {call.to_number} in the database."
                " Add it: uv run python -m scripts.add_business"
            )
            return None
        call_id = await save_call(db, route, call_row(call))
    except Exception:
        logger.exception(f"{label}: couldn't save the call")
        return None
    logger.info(f"{label}: saved as call {call_id}")
    return route.organization_id, call_id


# After-call work in progress, kept here because asyncio holds only a weak reference to a running task.
_running: set[asyncio.Task] = set()


def after_call_later(call: EndedCall, settings: Settings, *, label: str) -> None:
    """Starts `after_call` in the background, so the call's handler returns at once."""
    task = asyncio.create_task(after_call(call, settings, label=label))
    _running.add(task)
    task.add_done_callback(_running.discard)
