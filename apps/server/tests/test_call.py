from pipecat.frames.frames import TranscriptionFrame, TTSSpeakFrame, TTSUpdateSettingsFrame
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.tests.utils import run_test
from pipecat.transcriptions.language import Language

from tests.conftest import make_settings
from voice.call import build_services, opening_frames, transcript
from voice.language import LanguageFollower, base_language
from voice.prompt import CALL_CONNECTED


def caller_said(text: str, language: Language | None) -> TranscriptionFrame:
    return TranscriptionFrame(text=text, user_id="caller", timestamp="", language=language)


def test_base_language():
    assert base_language(Language.ES_MX) == Language.ES
    assert base_language("en-US") == Language.EN
    assert base_language("xx-nope") is None


async def test_voice_switches_before_the_reply_starts():
    down, _ = await run_test(
        LanguageFollower(),
        frames_to_send=[caller_said("Hola, necesito un plomero", Language.ES)],
        expected_down_frames=[TTSUpdateSettingsFrame, TranscriptionFrame],
    )
    assert down[0].delta.language == Language.ES


async def test_voice_stays_put_when_language_is_unchanged():
    await run_test(
        LanguageFollower(),
        frames_to_send=[caller_said("Hi there", Language.EN), caller_said("Do you fix leaks?", Language.EN_US)],
        expected_down_frames=[TranscriptionFrame, TranscriptionFrame],
    )


async def test_voice_follows_each_switch():
    down, _ = await run_test(
        LanguageFollower(),
        frames_to_send=[
            caller_said("Hola", Language.ES),
            caller_said("Sorry, English please", Language.EN),
            caller_said("no language detected", None),
        ],
        expected_down_frames=[
            TTSUpdateSettingsFrame,
            TranscriptionFrame,
            TTSUpdateSettingsFrame,
            TranscriptionFrame,
            TranscriptionFrame,
        ],
    )
    assert [down[0].delta.language, down[2].delta.language] == [Language.ES, Language.EN]


def test_opening_says_ai_and_recording_then_offers_spanish():
    frames = opening_frames("Bright Pipes Plumbing")
    assert [type(f) for f in frames] == [TTSSpeakFrame, TTSUpdateSettingsFrame, TTSSpeakFrame, TTSUpdateSettingsFrame]
    assert "AI assistant" in frames[0].text and "recorded" in frames[0].text
    assert frames[1].delta.language == Language.ES and frames[3].delta.language == Language.EN


def test_services_use_the_configured_models():
    stt, llm, tts = build_services(make_settings(llm_model="claude-haiku-5-5", business_name="Acme Drains"))
    assert stt._settings.model == "flux-general-multi"
    assert llm._settings.model == "claude-haiku-5-5"
    assert "Acme Drains" in llm._settings.system_instruction
    assert tts._settings.model == "sonic-3.6"


def test_transcript_skips_the_connect_note():
    context = LLMContext(
        messages=[
            {"role": "user", "content": CALL_CONNECTED},
            {"role": "assistant", "content": "Hi, thanks for calling."},
            {"role": "user", "content": [{"type": "text", "text": "My sink is leaking."}]},
        ]
    )
    assert transcript(context) == "AI: Hi, thanks for calling.\nCaller: My sink is leaking."
