import uuid
from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from typing import get_args

import pytest
from sqlalchemy.exc import OperationalError

from core.db import NumberRoute
from core.models import CALL_OUTCOMES
from tests.conftest import make_settings
from tests.test_summary import CALL, EMAIL_SETTINGS, PRIYA, logs  # noqa: F401 (logs is a fixture)
from tests.test_whatsapp import WHATSAPP_SETTINGS
from voice import after_call as after_call_module
from voice import summary
from voice.after_call import OUTCOMES, EndedCall, after_call, after_call_later, call_row
from voice.summary import CallSummary

SALON = "+16175550142"
ROUTE = NumberRoute(organization_id=uuid.uuid4(), agent_id=uuid.uuid4(), phone_number_id=uuid.uuid4())
START = datetime(2026, 11, 3, 10, 0, tzinfo=UTC)


def ended(turns=CALL, **overrides) -> EndedCall:
    values = dict(
        turns=turns,
        started_at=START,
        ended_at=START + timedelta(seconds=83.6),
        to_number=SALON,
        from_number="+919876543210",
        provider_call_id="v3:call-1",
        language="hi",
    )
    return EndedCall(**{**values, **overrides})


class FakeDatabase:
    """Stands in for Postgres: knows the numbers in `numbers`, or fails with `error`."""

    def __init__(self, numbers: dict[str, NumberRoute] | None = None, error: Exception | None = None):
        self.numbers = {SALON: ROUTE} if numbers is None else numbers
        self.error = error

    async def resolve_number(self, e164: str) -> NumberRoute | None:
        if self.error:
            raise self.error
        return self.numbers.get(e164)


@pytest.fixture
def world(monkeypatch):
    """Stands in for the calls table, Claude and Resend: what was saved, summarized and emailed."""
    box = SimpleNamespace(calls=[], summaries_saved=[], summary=PRIYA, summarized=0, emails=[])
    call_id = uuid.uuid4()

    async def fake_save_call(db, route, call):
        box.calls.append((route, call))
        return call_id

    async def fake_save_summary(db, organization_id, saved_id, summary_fields, outcome):
        box.summaries_saved.append((organization_id, saved_id, summary_fields, outcome))

    async def fake_summarize(transcript, settings):
        box.summarized += 1
        if isinstance(box.summary, Exception):
            raise box.summary
        return box.summary

    async def fake_email(email, settings):
        box.emails.append(email)

    monkeypatch.setattr(after_call_module, "save_call", fake_save_call)
    monkeypatch.setattr(after_call_module, "save_summary", fake_save_summary)
    monkeypatch.setattr(summary, "summarize", fake_summarize)
    monkeypatch.setattr(summary, "send_email", fake_email)
    box.call_id = call_id
    return box


async def test_the_call_is_saved_then_its_summary_and_the_owner_hears(world, logs):  # noqa: F811
    await after_call(ended(), make_settings(**EMAIL_SETTINGS), label="Call 1", db=FakeDatabase())

    [(route, row)] = world.calls
    assert route == ROUTE
    assert (row.to_number, row.from_number, row.provider_call_id, row.language) == (
        SALON,
        "+919876543210",
        "v3:call-1",
        "hi",
    )
    assert row.duration_seconds == 84 and row.outcome is None  # the outcome comes with the summary
    assert row.transcript[:2] == [
        {"role": "ai", "text": "Hello, thanks for calling Glow Salon."},
        {"role": "caller", "text": "मुझे कल haircut चाहिए, मेरा नाम प्रिया है"},
    ]
    [(organization_id, call_id, fields, outcome)] = world.summaries_saved
    assert (organization_id, call_id) == (ROUTE.organization_id, world.call_id)
    assert fields == PRIYA.model_dump() and outcome == "message"  # a booking request is a callback for the team
    assert len(world.emails) == 1
    assert f"Call 1: saved as call {world.call_id}" in "".join(logs)


async def test_one_summary_serves_the_call_and_both_channels(world, monkeypatch):
    whatsapps = []

    async def fake_whatsapp(message, settings):
        whatsapps.append(message)

    monkeypatch.setattr(summary, "send_whatsapp", fake_whatsapp)
    await after_call(ended(), make_settings(**EMAIL_SETTINGS, **WHATSAPP_SETTINGS), label="Call 1", db=FakeDatabase())
    assert world.summarized == 1
    assert len(world.summaries_saved) == 1 and len(world.emails) == 1 and len(whatsapps) == 1


async def test_a_silent_caller_is_saved_as_abandoned_and_nobody_is_bothered(world):
    silent = ended(turns=[("AI", "Hello, thanks for calling.")])
    await after_call(silent, make_settings(**EMAIL_SETTINGS), label="Call 1", db=FakeDatabase())
    [(_, row)] = world.calls
    assert row.outcome == "abandoned"
    assert world.summarized == 0 and world.summaries_saved == [] and world.emails == []


async def test_a_call_put_through_is_saved_as_a_transfer_and_the_owner_hears_it(world):
    put_through = ended(transferred_to="+919876543210")
    await after_call(put_through, make_settings(**EMAIL_SETTINGS), label="Call 1", db=FakeDatabase())
    [(_, row)] = world.calls
    assert row.outcome == "transfer"
    [(_, _, fields, outcome)] = world.summaries_saved
    assert fields["outcome"] == "booking request" and outcome == "transfer"  # the summary doesn't overwrite it
    [email] = world.emails
    assert "put this call through to +919876543210" in email.text


async def test_if_claude_fails_the_call_is_still_saved_and_emailed(world):
    world.summary = RuntimeError("overloaded")
    await after_call(ended(), make_settings(**EMAIL_SETTINGS), label="Call 1", db=FakeDatabase())
    assert len(world.calls) == 1 and world.summaries_saved == []
    [email] = world.emails
    assert "couldn't write a summary" in email.text


async def test_a_number_no_business_has_isnt_saved_but_the_owner_still_hears(world, logs):  # noqa: F811
    await after_call(ended(), make_settings(**EMAIL_SETTINGS), label="Call 1", db=FakeDatabase(numbers={}))
    assert world.calls == [] and world.summaries_saved == []
    assert len(world.emails) == 1
    assert f"no business has {SALON} in the database" in "".join(logs)
    assert "scripts.add_business" in "".join(logs)


async def test_the_database_being_down_never_stops_the_summary(world, logs):  # noqa: F811
    down = OperationalError("SELECT resolve_phone_number", {}, ConnectionRefusedError("connection refused"))
    await after_call(ended(), make_settings(**EMAIL_SETTINGS), label="Call 1", db=FakeDatabase(error=down))
    assert world.calls == [] and len(world.emails) == 1
    assert "Call 1: couldn't save the call" in "".join(logs) and "connection refused" in "".join(logs)


async def test_a_browser_call_needs_the_business_number_to_be_saved(world, logs):  # noqa: F811
    await after_call(ended(to_number=None), make_settings(**EMAIL_SETTINGS), label="Browser test call", db=FakeDatabase())
    assert world.calls == [] and len(world.emails) == 1
    assert "set BUSINESS_NUMBER to save browser test calls" in "".join(logs)


async def test_after_call_runs_in_the_background(world, monkeypatch):
    monkeypatch.setattr(after_call_module, "get_database", FakeDatabase)
    after_call_later(ended(), make_settings(**EMAIL_SETTINGS), label="Call 1")
    assert world.calls == []  # the call's handler has returned before anything is saved or sent
    [task] = after_call_module._running
    await task
    assert len(world.calls) == 1 and len(world.emails) == 1 and after_call_module._running == set()


def test_every_summary_outcome_has_a_calls_table_outcome():
    assert set(OUTCOMES) == set(get_args(CallSummary.model_fields["outcome"].annotation))
    assert set(OUTCOMES.values()) <= set(CALL_OUTCOMES)


def test_a_call_row_rounds_its_duration_and_keeps_who_said_what():
    row = call_row(ended(turns=[("AI", "Hi."), ("Caller", "Leak!")], ended_at=START + timedelta(seconds=4.4)))
    assert row.duration_seconds == 4
    assert row.transcript == [{"role": "ai", "text": "Hi."}, {"role": "caller", "text": "Leak!"}]
