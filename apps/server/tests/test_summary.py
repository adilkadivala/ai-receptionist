import json
from functools import partial
from types import SimpleNamespace

import httpx
import pytest
from loguru import logger
from pipecat.processors.aggregators.llm_context import LLMContext

from core.config import SUMMARY_KEYS
from tests.conftest import make_settings
from voice import summary
from voice.call import turns
from voice.prompt import CALL_CONNECTED
from voice.summary import CallSummary, compose, notify_owner, send_email, summarize, summarize_call

EMAIL_SETTINGS = {
    "resend_api_key": "re_test",
    "owner_email": "owner@example.com",
    "summary_from_email": "Receptionist <calls@example.com>",
}
CALL = [
    ("AI", "Hello, thanks for calling Glow Salon."),
    ("Caller", "मुझे कल haircut चाहिए, मेरा नाम प्रिया है"),
    ("Caller", "नौ आठ सात छह पांच चार तीन दो एक शून्य [digits heard: 98765 43210, 10 digits]"),
    ("AI", "Thank you Priya, the team will call you back to arrange a time."),
]
PRIYA = CallSummary(
    caller_name="Priya",
    phone_number="98765 43210 (not confirmed)",
    need="A haircut tomorrow.",
    urgency="normal",
    outcome="booking request",
    next_steps=["Call Priya back to arrange a time tomorrow."],
    headline="Priya: haircut tomorrow",
)


@pytest.fixture
def logs():
    """What the code logged, tracebacks included."""
    lines: list[str] = []
    handler = logger.add(lines.append, level="INFO")
    yield lines
    logger.remove(handler)


@pytest.fixture
def outbox(monkeypatch):
    """Stands in for Claude and Resend: `summary` is what Claude answers (or raises), `sent` the emails sent."""
    box = SimpleNamespace(summary=PRIYA, sent=[])

    async def fake_summarize(transcript, settings):
        if isinstance(box.summary, Exception):
            raise box.summary
        return box.summary

    async def fake_send(email, settings):
        box.sent.append(email)

    monkeypatch.setattr(summary, "summarize", fake_summarize)
    monkeypatch.setattr(summary, "send_email", fake_send)
    return box


@pytest.fixture
def resend(monkeypatch):
    """Answers Resend's API with `handler(request)` instead of the network."""

    def use(handler) -> None:
        monkeypatch.setattr(summary, "AsyncClient", partial(httpx.AsyncClient, transport=httpx.MockTransport(handler)))

    return use


def test_summary_emails_are_off_until_all_three_settings_are_set():
    assert make_settings().missing_keys(SUMMARY_KEYS) == ["RESEND_API_KEY", "OWNER_EMAIL", "SUMMARY_FROM_EMAIL"]
    assert make_settings(resend_api_key="re_test").missing_keys(SUMMARY_KEYS) == ["OWNER_EMAIL", "SUMMARY_FROM_EMAIL"]
    assert make_settings(**EMAIL_SETTINGS).missing_keys(SUMMARY_KEYS) == []


async def test_no_email_without_the_settings(outbox, logs):
    await notify_owner(PRIYA, CALL, make_settings(), label="Call 1")
    assert outbox.sent == []
    assert "set RESEND_API_KEY, OWNER_EMAIL, SUMMARY_FROM_EMAIL" in "".join(logs)


async def test_no_summary_or_email_when_the_caller_said_nothing(outbox, logs):
    settings = make_settings(**EMAIL_SETTINGS)
    for silent in ([("AI", "Hello, thanks for calling Glow Salon.")], []):
        assert await summarize_call(silent, settings) is None
        await notify_owner(None, silent, settings)
    assert outbox.sent == []
    assert "the caller said nothing" in "".join(logs)


async def test_the_owner_gets_the_summary_and_the_transcript(outbox, logs):
    await notify_owner(PRIYA, CALL, make_settings(**EMAIL_SETTINGS), label="Call 1", caller_id="+919876543210")
    [email] = outbox.sent
    assert email.subject == "Priya: haircut tomorrow"
    assert "Number given: 98765 43210 (not confirmed)" in email.text
    assert "Called from: +919876543210" in email.text
    assert "- Call Priya back to arrange a time tomorrow." in email.text
    assert "Caller: मुझे कल haircut चाहिए, मेरा नाम प्रिया है" in email.text  # the transcript, as said
    assert "Call 1: summary emailed to the owner" in "".join(logs)


async def test_if_claude_fails_the_transcript_still_goes(outbox, logs):
    outbox.summary = RuntimeError("overloaded")
    settings = make_settings(**EMAIL_SETTINGS)
    no_summary = await summarize_call(CALL, settings, label="Call 1")
    assert no_summary is None
    await notify_owner(no_summary, CALL, settings, label="Call 1", caller_id="+919876543210")
    [email] = outbox.sent
    assert email.subject == "Call for Bright Pipes Plumbing from +919876543210"
    assert "couldn't write a summary" in email.text and "Caller: मुझे कल haircut" in email.text
    assert "couldn't write the call summary" in "".join(logs) and "overloaded" in "".join(logs)


async def test_a_refused_email_is_logged_and_never_raised(resend, logs):
    resend(lambda request: httpx.Response(403, json={"name": "validation_error", "message": "The domain is not verified."}))
    await notify_owner(PRIYA, CALL, make_settings(**EMAIL_SETTINGS), label="Call 1")  # doesn't raise
    logged = "".join(logs)
    assert "Call 1: couldn't email the call summary" in logged
    assert "403" in logged and "domain is not verified" in logged
    assert "summary emailed" not in logged


async def test_a_network_failure_is_logged_and_never_raised(resend, logs):
    def unreachable(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectTimeout("timed out", request=request)

    resend(unreachable)
    await notify_owner(PRIYA, CALL, make_settings(**EMAIL_SETTINGS), label="Call 1")  # doesn't raise
    assert "Call 1: couldn't email the call summary" in "".join(logs) and "ConnectTimeout" in "".join(logs)


async def test_the_email_goes_through_resends_api(resend):
    requests: list[httpx.Request] = []

    def accept(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        return httpx.Response(200, json={"id": "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794"})

    resend(accept)
    email = compose(PRIYA, CALL, "Glow Salon")
    await send_email(email, make_settings(**EMAIL_SETTINGS))

    [request] = requests
    assert (request.method, str(request.url)) == ("POST", "https://api.resend.com/emails")
    assert request.headers["authorization"] == "Bearer re_test"
    assert request.headers["user-agent"].startswith("ai-receptionist-server/")  # Resend rejects requests without one
    assert json.loads(request.content) == {
        "from": "Receptionist <calls@example.com>",
        "to": ["owner@example.com"],
        "subject": email.subject,
        "text": email.text,
        "html": email.html,
    }


class FakeAnthropic:
    """Records what the summary asks Claude, and answers with `answer`."""

    calls: list[dict] = []
    answer = SimpleNamespace(parsed_output=PRIYA, stop_reason="end_turn")

    def __init__(self, **options):
        self.calls.append({"client": options})
        self.messages = SimpleNamespace(parse=self.parse)

    async def parse(self, **request):
        self.calls[-1]["request"] = request
        return self.answer

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        pass


async def test_claude_reads_the_transcript_and_answers_in_english(monkeypatch):
    monkeypatch.setattr(FakeAnthropic, "calls", [])
    monkeypatch.setattr(summary, "AsyncAnthropic", FakeAnthropic)
    settings = make_settings(business_name="Glow Salon", llm_model="claude-haiku-5-5")

    assert await summarize(summary.as_text(CALL), settings) == PRIYA

    [call] = FakeAnthropic.calls
    assert call["client"]["api_key"] == "anthropic-test"
    assert call["client"]["timeout"] == summary.SUMMARY_TIMEOUT_SECONDS  # a hung request can't hang on forever
    request = call["request"]
    assert request["model"] == "claude-haiku-5-5"
    assert request["output_format"] is CallSummary
    assert "for Glow Salon" in request["system"] and "Write in English" in request["system"]
    assert "[digits heard: 98765 43210, 10 digits]" in request["system"]  # it knows where numbers come from
    [message] = request["messages"]
    assert message["role"] == "user"
    assert message["content"] == f"<transcript>\n{summary.as_text(CALL)}\n</transcript>"


async def test_no_summary_from_claude_is_a_failure(monkeypatch):
    monkeypatch.setattr(FakeAnthropic, "answer", SimpleNamespace(parsed_output=None, stop_reason="refusal"))
    monkeypatch.setattr(summary, "AsyncAnthropic", FakeAnthropic)
    with pytest.raises(RuntimeError, match="refusal"):
        await summarize(summary.as_text(CALL), make_settings())


def test_the_email_escapes_what_was_said():
    email = compose(PRIYA, [("Caller", "<script>alert(1)</script> & co")], "Glow Salon")
    assert "<script>" not in email.html and "&lt;script&gt;" in email.html and "&amp; co" in email.html


def test_an_urgent_call_says_so_in_the_subject():
    emergency = compose(PRIYA.model_copy(update={"urgency": "emergency"}), CALL, "Glow Salon")
    assert emergency.subject == "[EMERGENCY] Priya: haircut tomorrow" and "Urgency: Emergency" in emergency.text
    assert compose(PRIYA.model_copy(update={"urgency": "urgent"}), CALL, "Glow Salon").subject.startswith("[Urgent] ")


def test_turns_are_what_each_side_said():
    context = LLMContext(
        messages=[
            {"role": "user", "content": CALL_CONNECTED},
            {"role": "assistant", "content": "Hi, thanks for calling."},
            {"role": "user", "content": "My sink is leaking."},
            {"role": "assistant", "content": None, "tool_calls": [{"id": "1", "function": {"name": "end_call"}}]},
        ]
    )
    assert turns(context) == [("AI", "Hi, thanks for calling."), ("Caller", "My sink is leaking.")]
