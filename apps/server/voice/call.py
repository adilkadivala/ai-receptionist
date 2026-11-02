"""One conversation: audio in -> Deepgram Flux -> Claude -> Cartesia -> audio out.

`converse` runs it on any transport: a Telnyx phone call (`run_call`) or a browser test call
(voice.browser). Flux also decides when the caller has finished talking (Pipecat applies its turn
strategy automatically), so there is no local voice-activity model to run.
"""

import asyncio

from fastapi import WebSocket
from loguru import logger
from pipecat.adapters.llm.schemas.tools_schema import ToolsSchema
from pipecat.frames.frames import EndFrame, TTSSpeakFrame, TTSUpdateSettingsFrame
from pipecat.pipeline.pipeline import Pipeline
from pipecat.pipeline.worker import PipelineParams, PipelineWorker
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.processors.aggregators.llm_response_universal import LLMContextAggregatorPair
from pipecat.runner.types import TelnyxCallData
from pipecat.serializers.telnyx import TelnyxFrameSerializer
from pipecat.services.anthropic.llm import AnthropicLLMService
from pipecat.services.cartesia.tts import CartesiaTTSService
from pipecat.services.deepgram.flux.stt import DeepgramFluxSTTService
from pipecat.services.settings import TTSSettings
from pipecat.transcriptions.language import Language
from pipecat.transports.base_transport import BaseTransport
from pipecat.transports.websocket.fastapi import FastAPIWebsocketParams, FastAPIWebsocketTransport
from pipecat.workers.runner import WorkerRunner

from core.config import Settings
from voice.end_call import END_CALL, end_call
from voice.language import LanguageFollower
from voice.prompt import CALL_CONNECTED, DEMO_BUSINESS_INFO, LANGUAGE_OFFERS, greeting, system_prompt

PHONE_SAMPLE_RATE = 8000  # Telnyx streams 8 kHz audio

TIME_LIMIT_GOODBYE = "We've reached the time limit for this call. The team will call you back. Goodbye."


def build_services(settings: Settings) -> tuple[DeepgramFluxSTTService, AnthropicLLMService, CartesiaTTSService]:
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
                settings.business_name, settings.business_info() or DEMO_BUSINESS_INFO, settings.voice_gender
            ),
            max_tokens=settings.llm_max_tokens,
            enable_prompt_caching=True,
        ),
    )
    llm.register_function(END_CALL.name, end_call)
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
    serializer = TelnyxFrameSerializer(
        stream_id=call.stream_id,
        call_control_id=call.call_id,
        outbound_encoding=call.outbound_encoding or "PCMU",
        inbound_encoding="PCMU",
        api_key=settings.telnyx_api_key,  # hangs up the call when the pipeline ends
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
    )


async def converse(
    transport: BaseTransport, settings: Settings, *, label: str, sample_rate: int, out_sample_rate: int | None = None
) -> None:
    """Greets the caller once they're connected, talks until they hang up, and says goodbye at the time limit.

    `sample_rate` is the audio coming in; the voice speaks at `out_sample_rate`, the same unless given.
    """
    stt, llm, tts = build_services(settings)

    context = LLMContext(messages=[{"role": "user", "content": CALL_CONNECTED}], tools=ToolsSchema(standard_tools=[END_CALL]))
    user_aggregator, assistant_aggregator = LLMContextAggregatorPair(context)

    pipeline = Pipeline(
        [
            transport.input(),
            stt,
            LanguageFollower(),
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
        # However the call ended: the caller hung up, the receptionist did (end_call), or the time limit.
        logger.info(f"{label}: ended. Transcript:\n{transcript(context)}")


def transcript(context: LLMContext) -> str:
    """The conversation as `Caller:` / `AI:` lines, for the log. Week 2 saves it and emails a summary."""
    lines = []
    for message in context.get_messages():
        role = message.get("role") if isinstance(message, dict) else None
        content = message.get("content") if isinstance(message, dict) else None
        if role not in ("user", "assistant") or content == CALL_CONNECTED:
            continue
        if isinstance(content, list):
            content = " ".join(part.get("text", "") for part in content if isinstance(part, dict))
        if not content:  # a message that only carries a tool call, such as end_call
            continue
        lines.append(f"{'Caller' if role == 'user' else 'AI'}: {content}")
    return "\n".join(lines)
