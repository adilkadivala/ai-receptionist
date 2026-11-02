import pytest
from pipecat.frames.frames import TranscriptionFrame, TTSSpeakFrame, TTSUpdateSettingsFrame
from pipecat.processors.aggregators.llm_context import LLMContext
from pipecat.tests.utils import run_test
from pipecat.transcriptions.language import Language
from pydantic import ValidationError

from tests.conftest import make_settings
from voice.call import build_services, opening_frames, transcript
from voice.language import LanguageFollower, base_language
from voice.prompt import CALL_CONNECTED, DEMO_BUSINESS_INFO


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


def test_opening_says_its_an_ai_then_offers_spanish():
    frames = opening_frames("Bright Pipes Plumbing")
    assert [type(f) for f in frames] == [TTSSpeakFrame, TTSUpdateSettingsFrame, TTSSpeakFrame, TTSUpdateSettingsFrame]
    assert "AI assistant" in frames[0].text
    assert "recorded" not in frames[0].text  # nothing records calls yet
    assert frames[1].delta.language == Language.ES and frames[3].delta.language == Language.EN


def test_opening_mentions_recording_only_when_calls_are_recorded():
    assert "this call may be recorded" in opening_frames("Acme Drains", announce_recording=True)[0].text


def test_prompt_uses_the_business_info_file(tmp_path, monkeypatch):
    monkeypatch.setattr("core.config.SERVER_DIR", tmp_path)
    (tmp_path / "acme.md").write_text("- Hours: Monday to Friday, 9 AM to 5 PM.\n", encoding="utf-8")
    _, llm, _ = build_services(make_settings(business_name="Acme Drains", business_info_file="acme.md"))
    assert "Monday to Friday, 9 AM to 5 PM" in llm._settings.system_instruction
    assert DEMO_BUSINESS_INFO not in llm._settings.system_instruction


def test_a_missing_business_info_file_stops_the_server_starting():
    with pytest.raises(ValidationError, match="BUSINESS_INFO_FILE"):
        make_settings(business_info_file="no-such-business.md")


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


def test_transcript_skips_the_hang_up():
    context = LLMContext(
        messages=[
            {"role": "user", "content": "Thanks, bye."},
            {"role": "assistant", "content": "Goodbye!"},
            {"role": "assistant", "content": None, "tool_calls": [{"id": "1", "function": {"name": "end_call"}}]},
        ]
    )
    assert transcript(context) == "Caller: Thanks, bye.\nAI: Goodbye!"


def test_opening_offers_hindi_for_an_indian_business():
    frames = opening_frames("Glow Salon", languages=["en", "hi"])
    assert frames[1].delta.language == Language.HI
    assert "हिंदी" in frames[2].text
    assert frames[3].delta.language == Language.EN


def test_opening_has_no_offer_with_one_language():
    assert [type(f) for f in opening_frames("Glow Salon", languages=["en"])] == [TTSSpeakFrame]


def test_listening_expects_the_business_languages():
    stt, _, _ = build_services(make_settings(caller_languages="en, HI"))
    assert stt._settings.language_hints == [Language.EN, Language.HI]


def test_prompt_matches_the_voice_gender():
    _, llm, _ = build_services(make_settings(voice_gender="masculine"))
    assert "a man's voice" in llm._settings.system_instruction
    assert "कर देता हूँ" in llm._settings.system_instruction


def test_greeting_language_must_come_first():
    with pytest.raises(ValidationError, match="must start with en"):
        make_settings(caller_languages="hi,en")
