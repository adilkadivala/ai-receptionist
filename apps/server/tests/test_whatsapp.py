import json
from functools import partial
from types import SimpleNamespace

import httpx
import pytest
from pydantic import ValidationError

from core.config import WHATSAPP_KEYS
from tests.conftest import make_settings
from tests.test_summary import CALL, EMAIL_SETTINGS, PRIYA, logs  # noqa: F401 (logs is a fixture)
from voice import summary, whatsapp
from voice.summary import CallSummary, notify_owner, whatsapp_fields
from voice.whatsapp import one_line, send_whatsapp, template_message

WHATSAPP_SETTINGS = {
    "whatsapp_token": "EAAG-test",
    "whatsapp_phone_number_id": "106540352242922",
    "owner_whatsapp": "+919876543210",
}


@pytest.fixture
def channels(monkeypatch):
    """Stands in for Resend and WhatsApp: what was emailed and sent on WhatsApp."""
    box = SimpleNamespace(emails=[], whatsapps=[], whatsapp_error=None)

    async def fake_email(email, settings):
        box.emails.append(email)

    async def fake_whatsapp(message, settings):
        if box.whatsapp_error:
            raise box.whatsapp_error
        box.whatsapps.append(message)
        return "wamid.test"

    monkeypatch.setattr(summary, "send_email", fake_email)
    monkeypatch.setattr(summary, "send_whatsapp", fake_whatsapp)
    return box


def fields_of(message: dict) -> dict[str, str]:
    [body] = message["template"]["components"]
    return {param["parameter_name"]: param["text"] for param in body["parameters"]}


def test_whatsapp_is_off_until_three_settings_are_set():
    assert make_settings().missing_keys(WHATSAPP_KEYS) == ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "OWNER_WHATSAPP"]
    assert make_settings(**WHATSAPP_SETTINGS).missing_keys(WHATSAPP_KEYS) == []


def test_the_owners_number_needs_its_country_code():
    assert make_settings(owner_whatsapp="+91 98765-43210").owner_whatsapp == "+919876543210"
    with pytest.raises(ValidationError, match="OWNER_WHATSAPP"):
        make_settings(owner_whatsapp="9876543210")


async def test_whatsapp_only(channels, logs):  # noqa: F811
    await notify_owner(PRIYA, CALL, make_settings(**WHATSAPP_SETTINGS), label="Call 1")
    [message] = channels.whatsapps
    assert channels.emails == []
    assert message["to"] == "+919876543210" and message["template"]["name"] == "call_summary"
    assert fields_of(message) == {
        "business": "Bright Pipes Plumbing",
        "caller": "Priya",
        "number": "98765 43210 (not confirmed)",
        "need": "A haircut tomorrow.",
        "urgency": "Normal",
        "next_step": "Call Priya back to arrange a time tomorrow.",
    }
    assert "Call 1: summary sent to the owner on WhatsApp" in "".join(logs)


async def test_both_channels_at_once(channels):
    await notify_owner(PRIYA, CALL, make_settings(**EMAIL_SETTINGS, **WHATSAPP_SETTINGS), label="Call 1")
    assert len(channels.emails) == 1 and len(channels.whatsapps) == 1


async def test_a_whatsapp_failure_still_lets_the_email_go(channels, logs):  # noqa: F811
    channels.whatsapp_error = RuntimeError("WhatsApp refused the message (400, error 132001: template not approved)")
    await notify_owner(PRIYA, CALL, make_settings(**EMAIL_SETTINGS, **WHATSAPP_SETTINGS), label="Call 1")  # doesn't raise
    assert len(channels.emails) == 1
    logged = "".join(logs)
    assert "couldn't send the call summary on WhatsApp" in logged and "132001" in logged
    assert "summary emailed to the owner" in logged


async def test_without_a_summary_whatsapp_waits_for_the_email(channels, logs):  # noqa: F811
    await notify_owner(None, CALL, make_settings(**EMAIL_SETTINGS, **WHATSAPP_SETTINGS), label="Call 1")
    assert channels.whatsapps == [] and len(channels.emails) == 1  # the email carries the transcript alone
    assert "no WhatsApp message, because there's no summary" in "".join(logs)


def test_fields_fall_back_to_the_caller_id_and_join_the_steps():
    quiet = CallSummary(
        caller_name="Not given",
        phone_number="Not given",
        need="Asked if they're open Sunday.",
        urgency="low",
        outcome="question answered",
        next_steps=[],
        headline="Opening hours question",
    )
    fields = whatsapp_fields(quiet, "Glow Salon", caller_id="+14155550142")
    assert fields["number"] == "+14155550142 (the number they called from)"
    assert fields["next_step"] == "Nothing to do." and fields["urgency"] == "Low (nothing to do)"
    two_steps = whatsapp_fields(PRIYA.model_copy(update={"next_steps": ["Call back.", "Bring a ladder."]}), "Glow Salon")
    assert two_steps["next_step"] == "Call back. Bring a ladder."


def test_fields_are_one_line_and_short():
    assert one_line("Burst pipe\n\tin the   kitchen ") == "Burst pipe in the kitchen"
    long = one_line("leak " * 100)
    assert len(long) == 300 and long.endswith("…")


async def test_the_message_goes_through_metas_api():
    seen = {}

    def meta(request: httpx.Request) -> httpx.Response:
        seen["url"], seen["auth"], seen["body"] = str(request.url), request.headers["authorization"], json.loads(request.content)
        return httpx.Response(200, json={"messaging_product": "whatsapp", "messages": [{"id": "wamid.ABC"}]})

    settings = make_settings(**WHATSAPP_SETTINGS)
    message = template_message({"business": "Glow Salon"}, to="+919876543210", template="call_summary", language="en")
    transport = partial(httpx.AsyncClient, transport=httpx.MockTransport(meta))
    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(whatsapp, "AsyncClient", transport)
        assert await send_whatsapp(message, settings) == "wamid.ABC"
    assert seen["url"] == "https://graph.facebook.com/v26.0/106540352242922/messages"
    assert seen["auth"] == "Bearer EAAG-test"
    assert seen["body"]["messaging_product"] == "whatsapp" and seen["body"]["type"] == "template"
    assert seen["body"]["template"]["language"] == {"code": "en"}


async def test_metas_refusal_names_its_error_code():
    def meta(request: httpx.Request) -> httpx.Response:
        error = {"message": "Template name does not exist in the translation", "code": 132001, "error_data": {"details": "x"}}
        return httpx.Response(404, json={"error": error})

    with pytest.MonkeyPatch.context() as patch:
        patch.setattr(whatsapp, "AsyncClient", partial(httpx.AsyncClient, transport=httpx.MockTransport(meta)))
        with pytest.raises(RuntimeError, match="404, error 132001: Template name does not exist"):
            await send_whatsapp(template_message({}, "+919876543210", "call_summary", "en"), make_settings(**WHATSAPP_SETTINGS))
