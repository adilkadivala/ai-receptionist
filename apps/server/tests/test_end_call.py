from pipecat.frames.frames import EndWorkerFrame
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.services.llm_service import FunctionCallParams

from tests.conftest import make_settings
from voice.call import build_services
from voice.end_call import END_CALL, end_call


class FakeLLM:
    def __init__(self):
        self.pushed = []

    async def push_frame(self, frame, direction=None):
        self.pushed.append(frame)


async def test_hanging_up_ends_the_call_without_another_reply():
    llm, results = FakeLLM(), []

    async def result_callback(result, *, properties=None):
        results.append((result, properties))

    params = FunctionCallParams(
        function_name="end_call",
        tool_call_id="call-1",
        arguments={},
        llm=llm,
        pipeline_worker=None,
        context=LLMContext(),
        result_callback=result_callback,
    )
    await end_call(params)

    [(result, properties)] = results
    assert result == {"ended": True}
    assert properties.run_llm is False  # the goodbye came with the tool call; nothing more to say
    # Ends gracefully: frames already queued (the goodbye) are spoken before the call closes.
    assert [type(frame) for frame in llm.pushed] == [EndWorkerFrame]


def test_the_receptionist_can_hang_up():
    _, llm, _ = build_services(make_settings())
    assert END_CALL.name in llm._functions
    assert "call end_call" in llm._settings.system_instruction
