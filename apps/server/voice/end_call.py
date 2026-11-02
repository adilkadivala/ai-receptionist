"""The end_call tool: the receptionist hangs up once the conversation is over, as a person would.

Without it the line stays open after the goodbyes, and every further "bye" from the caller gets another
goodbye. Claude calls it in the same reply as its one goodbye; the call ends once that goodbye has been
spoken, on the phone (Telnyx hangs up) and in a browser test call (the WebRTC connection closes).
"""

from loguru import logger
from pipecat.adapters.llm.schemas.function_schema import FunctionSchema
from pipecat.frames.frames import EndWorkerFrame, FunctionCallResultProperties
from pipecat.services.llm_service import FunctionCallParams

END_CALL = FunctionSchema(
    name="end_call",
    description=(
        "Hang up the call. Use it once the caller has said goodbye or clearly has nothing more to ask, "
        "in the same reply as your one short goodbye. Never before you've answered what they asked."
    ),
    properties={},
    required=[],
)


async def end_call(params: FunctionCallParams) -> None:
    """Ends the call after the goodbye in the same reply: frames queued ahead of the end still play."""
    logger.info("The receptionist ended the call")
    # Nothing more for Claude to say: the goodbye came with the call to this tool.
    await params.result_callback({"ended": True}, properties=FunctionCallResultProperties(run_llm=False))
    await params.llm.push_frame(EndWorkerFrame(reason="end_call"))
