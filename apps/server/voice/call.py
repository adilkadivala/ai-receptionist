"""One phone call: Telnyx audio in -> Deepgram Flux -> Claude -> Cartesia -> Telnyx audio out.

Flux also decides when the caller has finished talking (Pipecat applies its turn strategy
automatically), so there is no local voice-activity model to run.
"""

from fastapi import WebSocket
from loguru import logger
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
from pipecat.transports.websocket.fastapi import FastAPIWebsocketParams, FastAPIWebsocketTransport
from pipecat.workers.runner import WorkerRunner

from core.config import Settings
from voice.language import LanguageFollower
from voice.prompt import CALL_CONNECTED, SPANISH_OFFER, greeting, system_prompt

PHONE_SAMPLE_RATE = 8000  # Telnyx streams 8 kHz audio


def build_services(settings: Settings) -> tuple[DeepgramFluxSTTService, AnthropicLLMService, CartesiaTTSService]:
    stt = DeepgramFluxSTTService(
        api_key=settings.deepgram_api_key,
        settings=DeepgramFluxSTTService.Settings(model=settings.stt_model, language_hints=[Language.EN, Language.ES]),
    )
    llm = AnthropicLLMService(
        # None lets the SDK find credentials itself (env vars, `ant auth login` profile).
        api_key=settings.anthropic_api_key or None,
        settings=AnthropicLLMService.Settings(
            model=settings.llm_model,
            system_instruction=system_prompt(settings.business_name),
            max_tokens=settings.llm_max_tokens,
            enable_prompt_caching=True,
        ),
    )
    tts = CartesiaTTSService(
        api_key=settings.cartesia_api_key,
        settings=CartesiaTTSService.Settings(model=settings.tts_model, voice=settings.tts_voice_id, language=Language.EN),
    )
    return stt, llm, tts


def opening_frames(business_name: str) -> list:
    """Greeting with the AI and recording notice, then an offer in Spanish."""
    return [
        TTSSpeakFrame(greeting(business_name)),
        TTSUpdateSettingsFrame(delta=TTSSettings(language=Language.ES)),
        TTSSpeakFrame(SPANISH_OFFER),
        TTSUpdateSettingsFrame(delta=TTSSettings(language=Language.EN)),
    ]


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
            session_timeout=settings.max_call_seconds,
        ),
    )
    stt, llm, tts = build_services(settings)

    context = LLMContext(messages=[{"role": "user", "content": CALL_CONNECTED}])
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
            audio_in_sample_rate=PHONE_SAMPLE_RATE,
            audio_out_sample_rate=PHONE_SAMPLE_RATE,
            enable_metrics=True,
            enable_usage_metrics=True,
        ),
    )
    runner = WorkerRunner(handle_sigint=False)
    await runner.add_workers(worker)

    @transport.event_handler("on_client_connected")
    async def on_client_connected(transport, client):
        logger.info(f"Call {call.call_id} from {call.from_number} to {call.to_number}")
        await worker.queue_frames(opening_frames(settings.business_name))

    @transport.event_handler("on_session_timeout")
    async def on_session_timeout(transport, websocket):
        logger.info(f"Call {call.call_id} reached the {settings.max_call_seconds}s limit")
        await worker.queue_frames(
            [TTSSpeakFrame("We've reached the time limit for this call. The team will call you back. Goodbye."), EndFrame()]
        )

    @transport.event_handler("on_client_disconnected")
    async def on_client_disconnected(transport, client):
        logger.info(f"Call {call.call_id} ended. Transcript:\n{transcript(context)}")
        await runner.cancel()

    await runner.run()


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
        lines.append(f"{'Caller' if role == 'user' else 'AI'}: {content}")
    return "\n".join(lines)
