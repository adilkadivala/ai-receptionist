import pytest
from pipecat.frames.frames import CancelFrame, EndFrame, EndWorkerFrame, InterruptionFrame
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.services.llm_service import FunctionCallParams
from pydantic import ValidationError

from tests.conftest import make_settings
from tests.test_end_call import FakeLLM
from tests.test_summary import CALL, PRIYA, logs  # noqa: F401 (logs is a fixture)
from voice.call import build_services
from voice.summary import compose, whatsapp_fields
from voice.transfer import TRANSFER_CALL, TelnyxLine, Transfer

OWNER = "+919876543210"


def phone_line() -> TelnyxLine:
    return TelnyxLine("stream-1", "PCMU", "PCMU", call_control_id="v3:call-1", api_key="telnyx-test")


async def ask_to_transfer(transfer: Transfer) -> tuple[FakeLLM, list]:
    """Calls the tool as Claude would, with a reason; returns what it pushed and the results it reported."""
    llm, results = FakeLLM(), []

    async def result_callback(result, *, properties=None):
        results.append((result, properties))

    params = FunctionCallParams(
        function_name="transfer_call",
        tool_call_id="call-1",
        arguments={"reason": "burst pipe, kitchen flooding"},
        llm=llm,
        pipeline_worker=None,
        context=LLMContext(),
        result_callback=result_callback,
    )
    await transfer(params)
    return llm, results


async def test_putting_a_caller_through_hands_the_line_over(logs):  # noqa: F811
    line = phone_line()
    transfer = Transfer(OWNER, line, "Call 1")
    llm, [(result, properties)] = await ask_to_transfer(transfer)

    assert line.handed_over and transfer.put_through
    assert result == {"transferred": True}
    assert properties.run_llm is False  # the "putting you through" line came with the tool call
    # Our side ends once that line has played; the TeXML <Dial> takes the caller from there.
    assert [type(frame) for frame in llm.pushed] == [EndWorkerFrame]
    assert f"Call 1: putting the caller through to {OWNER} (burst pipe, kitchen flooding)" in "".join(logs)


async def test_a_handed_over_line_ends_our_side_without_hanging_up(monkeypatch):
    hang_ups = []

    async def fake_hang_up(self):
        hang_ups.append(self)

    monkeypatch.setattr(TelnyxLine, "_hang_up_call", fake_hang_up)
    line = phone_line()
    line.handed_over = True
    assert await line.serialize(EndFrame()) is None
    assert await line.serialize(CancelFrame()) is None
    assert hang_ups == []
    assert await line.serialize(InterruptionFrame()) == '{"event": "clear"}'  # everything else as before

    ended_by_the_ai = phone_line()
    await ended_by_the_ai.serialize(EndFrame())
    assert hang_ups == [ended_by_the_ai]  # a call that wasn't put through is still hung up


async def test_a_browser_test_call_only_ends(logs):  # noqa: F811
    transfer = Transfer(OWNER, None, "Browser test call")
    llm, [(result, _)] = await ask_to_transfer(transfer)
    assert not transfer.put_through and result == {"transferred": True}
    assert [type(frame) for frame in llm.pushed] == [EndWorkerFrame]
    assert f"a phone call would be put through to {OWNER} now" in "".join(logs)


def test_the_receptionist_puts_emergencies_through_only_with_a_transfer_number():
    _, llm, _ = build_services(make_settings(transfer_number=OWNER), Transfer(OWNER, None, "Call 1"))
    prompt = llm._settings.system_instruction
    assert TRANSFER_CALL.name in llm._functions
    assert "call transfer_call in the same reply" in prompt
    assert "call emergency services" in prompt and "isn't an emergency, don't put them through" in prompt

    _, llm, _ = build_services(make_settings())
    assert TRANSFER_CALL.name not in llm._functions
    assert "transfer_call" not in llm._settings.system_instruction
    assert "say the team\n  will call back right away" in llm._settings.system_instruction


def test_the_transfer_number_is_a_persons_international_number():
    assert make_settings(transfer_number="+91 98765-43210").transfer_number == OWNER
    with pytest.raises(ValidationError, match="TRANSFER_NUMBER must be a number with \\+"):
        make_settings(transfer_number="98765 43210")
    with pytest.raises(ValidationError, match="not BUSINESS_NUMBER"):
        make_settings(business_number="+16175550142", transfer_number="+1 617 555 0142")


def test_the_owner_hears_the_call_was_put_through():
    fields = whatsapp_fields(PRIYA, "Glow Salon", put_through_to=OWNER)
    assert fields["next_step"] == (
        f"The receptionist put this call through to {OWNER}. If you missed it, call them back."
        " Call Priya back to arrange a time tomorrow."
    )
    email = compose(PRIYA, CALL, "Glow Salon", put_through_to=OWNER)
    assert f"put this call through to {OWNER}. If you missed it" in email.text
    assert f"put this call through to {OWNER}. If you missed it" in email.html
    assert "put this call through" not in compose(PRIYA, CALL, "Glow Salon").text
