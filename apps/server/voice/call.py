"""One conversation: audio in -> Deepgram Flux -> Claude -> Cartesia -> audio out.

`converse` runs it on any transport: a Telnyx phone call (`run_call`) or a browser test call
(voice.browser). Flux also decides when the caller has finished talking (Pipecat applies its turn
strategy automatically), so there is no local voice-activity model to run.
"""

import asyncio
from datetime import UTC, datetime

from fastapi import WebSocket
from loguru import logger
from pipecat.adapters.llm.schemas.tools_schema import ToolsSchema
from pipecat.frames.frames import EndFrame, TTSSpeakFrame, TTSUpdateSettingsFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.runner.types import TelnyxCallData
from pipecat.services.anthropic.llm import AnthropicLLMService
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.flux.stt import DeepgramFluxSTTService
from pipecat.services.settings import TTSSettings
from pipecat.transcriptions.language import Language
from pipecat.transports.base_transport import BaseTransport
from pipecat.transports.websocket.fastapi import FastAPIWebsocketParams, FastAPIWebsocketTransport
from pipecat.workers.runner import WorkerRunner

from core.config import Settings
from voice.after_call import EndedCall, after_call_later
from voice.end_call import END_CALL, end_call
from voice.language import LanguageFollower
from voice.numbers import NumberNoter
from voice.prompt import CALL_CONNECTED, DEMO_BUSINESS_INFO, LANGUAGE_OFFERS, greeting, system_prompt
from voice.summary import AI, CALLER, Turn, as_text
from voice.transfer import TRANSFER_CALL, TelnyxLine, Transfer

PHONE_SAMPLE_RATE = 8000  # Telnyx streams 8 kHz audio

TIME_LIMIT_GOODBYE = "We've reached the time limit for this call. The team will call you back. Goodbye."


def build_services(
    settings: Settings, transfer: Transfer | None = None
) -> tuple[DeepgramFluxSTTService, AnthropicLLMService, CartesiaTTSService]:
    """The call's listening, brain and voice. With `transfer`, the receptionist can put emergency callers through."""
    stt = DeepgramFluxSTTService(
        api_key=settings.deepgram_api_key,
        settings=DeepgramFluxSTTService.Settings(
            model=settings.stt_model, language_hints=[Language(code) for code in settings.languages()]
        ),
    )
    llm = AnthropicLLMService(
        # None lets the SDK find credentials itself (env vars, `ant auth login` profile).
        api_key=settings.anthropic_api_key or None,
        settings=AnthropicLLMService.Settings(
            model=settings.llm_model,
            system_instruction=system_prompt(
                settings.business_name,
                settings.business_info() or DEMO_BUSINESS_INFO,
                settings.voice_gender,
                settings.business_country,
                can_transfer=transfer is not None,
            ),
            max_tokens=settings.llm_max_tokens,
            enable_prompt_caching=True,
        ),
    )
    llm.register_function(END_CALL.name, end_call)
    if transfer:
        llm.register_function(TRANSFER_CALL.name, transfer)
    tts = CartesiaTTSService(
        api_key=settings.cartesia_api_key,
        settings=CartesiaTTSService.Settings(model=settings.tts_model, voice=settings.tts_voice_id, language=Language.EN),
    )
    return stt, llm, tts


def opening_frames(business_name: str, announce_recording: bool = False, languages: list[str] | None = None) -> list:
    """The English greeting with the AI notice (and the recording notice, if calls are recorded), then an offer in the
    business's second language when there's a line for it: Spanish by default."""
    frames: list = [TTSSpeakFrame(greeting(business_name, announce_recording))]
    second = (languages or ["en", "es"])[1:2]
    if second and (offer := LANGUAGE_OFFERS.get(second[0])):
        frames += [
            TTSUpdateSettingsFrame(delta=TTSSettings(language=Language(second[0]))),
            TTSSpeakFrame(offer),
            TTSUpdateSettingsFrame(delta=TTSSettings(language=Language.EN)),
        ]
    return frames


async def run_call(websocket: WebSocket, call: TelnyxCallData, settings: Settings) -> None:
    serializer = TelnyxLine(
        stream_id=call.stream_id,
        call_control_id=call.call_id,
        outbound_encoding=call.outbound_encoding or "PCMU",
        inbound_encoding="PCMU",
        api_key=settings.telnyx_api_key,  # hangs up the call when the pipeline ends, unless it was put through
    )
    transport = FastAPIWebsocketTransport(
        websocket=websocket,
        params=FastAPIWebsocketParams(
            audio_in_enabled=True,
            audio_out_enabled=True,
            add_wav_header=False,
            serializer=serializer,
        ),
    )
    await converse(
        transport,
        settings,
        label=f"Call {call.call_id} from {call.from_number} to {call.to_number}",
        sample_rate=PHONE_SAMPLE_RATE,
        caller_id=call.from_number,
        dialed_number=call.to_number,
        provider_call_id=call.call_id,
        line=serializer,
    )


async def converse(
    transport: BaseTransport,
    settings: Settings,
    *,
    label: str,
    sample_rate: int,
    out_sample_rate: int | None = None,
    caller_id: str | None = None,
    dialed_number: str | None = None,
    provider_call_id: str | None = None,
    line: TelnyxLine | None = None,
) -> None:
    """Greets the caller once they're connected, talks until they hang up, and says goodbye at the time limit. Then
    the call is saved, and the owner gets a summary by email and on WhatsApp (voice.after_call).

    `sample_rate` is the audio coming in; the voice speaks at `out_sample_rate`, the same unless given. `caller_id` is
    the number the phone network says the call came from, `dialed_number` the one the caller dialed: the call is saved
    under the business that owns it. `line` is a phone call's serializer, which a call put through to TRANSFER_NUMBER
    hands over (voice.transfer); a browser test call has none.
    """
    transfer = Transfer(settings.transfer_number, line, label) if settings.transfer_number else None
    stt, llm, tts = build_services(settings, transfer)
    language_follower = LanguageFollower()
    started_at = datetime.now(UTC)

    tools = [END_CALL, TRANSFER_CALL] if transfer else [END_CALL]
    context = LLMContext(messages=[{"role": "user", "content": CALL_CONNECTED}], tools=ToolsSchema(standard_tools=tools))
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(context)

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            language_follower,
            NumberNoter(settings.business_country),
            user_aggregator,
            llm,
            tts,
            transport.output(),
            assistant_aggregator,
        ]
    )
    worker = PipelineWorker(
        pipeline,
        params=PipelineParams(
            audio_in_sample_rate=sample_rate,
            audio_out_sample_rate=out_sample_rate or sample_rate,
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
    )
    runner = WorkerRunner(handle_sigint=False)
    await runner.add_workers(worker)

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        nonlocal started_at
        started_at = datetime.now(UTC)  # the call's time counts from when the caller is on the line
        logger.info(f"{label}: connected")
        await worker.queue_frames(opening_frames(settings.business_name, settings.announce_recording, settings.languages()))

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        await runner.cancel()

    # Hard cap per call, so a stuck or spam call can't burn minutes.
    async def time_limit():
        await asyncio.sleep(settings.max_call_seconds)
        logger.info(f"{label}: reached the {settings.max_call_seconds}s limit")
        await worker.queue_frames([TTSSpeakFrame(TIME_LIMIT_GOODBYE), EndFrame()])

    timer = asyncio.create_task(time_limit())
    try:
        await runner.run()
    finally:
        timer.cancel()
        # However the call ended: the caller hung up, the receptionist did (end_call) or put them through
        # (transfer_call), or the time limit.
        logger.info(f"{label}: ended. Transcript:\n{transcript(context)}")
        ended = EndedCall(
            turns=turns(context),
            started_at=started_at,
            ended_at=datetime.now(UTC),
            to_number=dialed_number,
            from_number=caller_id,
            provider_call_id=provider_call_id,
            language=language_follower.language.value,
            transferred_to=transfer.number if transfer and transfer.put_through else None,
        )
        # In the background: saving and the owner's summary wait on the database, Claude and Resend; the call must not.
        after_call_later(ended, settings, label=label)


def turns(context: LLMContext) -> list[Turn]:
    """What the caller and the AI said, in order, without the connect note and tool calls."""
    said = []
    for message in context.get_messages():
        role = message.get("role") if isinstance(message, dict) else None
        content = message.get("content") if isinstance(message, dict) else None
        if role not in ("user", "assistant") or content == CALL_CONNECTED:
            continue
        if isinstance(content, list):
            content = " ".join(part.get("text", "") for part in content if isinstance(part, dict))
        if not content:  # a message that only carries a tool call, such as end_call
            continue
        said.append((CALLER if role == "user" else AI, content))
    return said


def transcript(context: LLMContext) -> str:
    """The conversation as `Caller:` / `AI:` lines, for the log."""
    return as_text(turns(context))
