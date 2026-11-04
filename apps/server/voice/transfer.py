"""The transfer_call tool: the receptionist puts an emergency caller through to a person, TRANSFER_NUMBER.

The handover stays inside TeXML, as Telnyx asks (it advises against mixing TeXML calls with Call Control commands
such as transfer). The TeXML bin (voice.texml) has a <Dial> to TRANSFER_NUMBER after the <Connect><Stream>, and Telnyx
runs what follows <Connect> once the stream stops. So putting a caller through means closing our stream without
hanging up: Telnyx then rings the owner. A call the AI ends itself is hung up first (pipecat does it through Call
Control as the call ends), so it never reaches the <Dial>. The same <Dial> catches calls our server drops, as when it's
down or restarting.
"""

from loguru import logger
from pipecat.adapters.llm.schemas.function_schema import FunctionSchema
from pipecat.frames.frames import CancelFrame, EndFrame, EndWorkerFrame, Frame, FunctionCallResultProperties
from pipecat.serializers.telnyx import TelnyxFrameSerializer
from pipecat.services.llm_service import FunctionCallParams

TRANSFER_CALL = FunctionSchema(
    name="transfer_call",
    description=(
        "Put the caller through to the team on the phone, now. Only for an emergency: harm or damage happening now. "
        "Use it in the same reply as one short line saying you're putting them through."
    ),
    properties={"reason": {"type": "string", "description": "The emergency, in a few words: 'burst pipe, kitchen flooding'."}},
    required=["reason"],
)


class TelnyxLine(TelnyxFrameSerializer):
    """Telnyx's serializer, except that once the call is handed over, ending our side doesn't hang up the caller.

    Pipecat hangs up when the end of the call passes through serialize(); skipping it there leaves the caller on the
    line for the TeXML <Dial>.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.handed_over = False

    async def serialize(self, frame: Frame) -> str | bytes | None:
        if self.handed_over and isinstance(frame, (EndFrame, CancelFrame)):
            return None
        return await super().serialize(frame)


class Transfer:
    """The transfer_call handler for one call. `line` is the phone call's serializer; a browser test call has none,
    so it can't be put through: it ends, as it would on the phone, and the log says where it would have gone."""

    def __init__(self, number: str, line: TelnyxLine | None, label: str):
        self.number = number
        self.line = line
        self.label = label
        self.put_through = False  # True once a phone call has been handed to the team

    async def __call__(self, params: FunctionCallParams) -> None:
        reason = params.arguments.get("reason", "")
        if self.line:
            self.line.handed_over = self.put_through = True
            logger.info(f"{self.label}: putting the caller through to {self.number} ({reason})")
        else:
            logger.info(f"{self.label}: a phone call would be put through to {self.number} now ({reason}); ending it")
        # Nothing more for Claude to say: the "putting you through" line came with the call to this tool.
        await params.result_callback({"transferred": True}, properties=FunctionCallResultProperties(run_llm=False))
        # Ends our side once that line has been spoken (frames queued ahead of the end still play).
        await params.llm.push_frame(EndWorkerFrame(reason="transfer_call"))
