from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# apps/server, which relative file paths in settings are read from.
SERVER_DIR = Path(__file__).resolve().parents[1]

# What a phone call needs. A browser test call (voice.browser) needs only the listening and voice keys.
REQUIRED_KEYS = ("media_stream_token", "telnyx_api_key", "deepgram_api_key", "cartesia_api_key")
VOICE_KEYS = ("deepgram_api_key", "cartesia_api_key")
# What the summary email after each call needs (voice.summary). Without all three, no email.
SUMMARY_KEYS = ("resend_api_key", "owner_email", "summary_from_email")


class Settings(BaseSettings):
    # env_ignore_empty: an empty shell variable must not override the value in server/.env.
    model_config = SettingsConfigDict(env_file=".env", extra="ignore", env_ignore_empty=True)

    # Database (infra/compose/dev.yml). The processes connect as the app role, which row-level
    # security limits to one organization per transaction. Migrations run as the owner role.
    database_url: str = "postgresql+psycopg://receptionist_app:app-dev@localhost:5433/receptionist"
    migration_database_url: str = "postgresql+psycopg://receptionist_owner:owner-dev@localhost:5433/receptionist"
    # Role the migrations grant table access to; must match the role in database_url.
    db_app_role: str = "receptionist_app"

    # Public hostname Telnyx reaches this server on (e.g. abc123.ngrok-free.app), no scheme.
    # Only used to print the TeXML snippet: `uv run python -m voice.texml`.
    public_host: str = ""
    # Secret path segment of the media-stream URL (/telnyx/media/<token>). Only Telnyx knows it,
    # through the TeXML bin, so strangers can't open streams that spend our API minutes.
    # Generate one: python -c "import secrets; print(secrets.token_urlsafe(24))"
    media_stream_token: str = ""

    # Provider keys. Telnyx's is used to hang up the call when the AI ends it.
    telnyx_api_key: str = ""
    deepgram_api_key: str = ""
    cartesia_api_key: str = ""
    # Leave empty to fall back to the Anthropic SDK's own lookup (env vars, `ant auth login` profile).
    anthropic_api_key: str = ""

    # Listening: Deepgram Flux, multilingual model (EN, ES, FR, DE, PT, IT, NL, JA, RU, HI).
    stt_model: str = "flux-general-multi"
    # Brain: Claude. Pipecat turns thinking off for Haiku 5.5, which keeps replies fast.
    llm_model: str = "claude-haiku-5-5"
    llm_max_tokens: int = 300  # spoken replies are a sentence or two
    # Voice: Cartesia. The default voice is the one in Pipecat's Telnyx example; pick your own
    # in the Cartesia playground (it must speak English and Spanish) or use an owner's clone.
    tts_model: str = "sonic-3.6"
    tts_voice_id: str = "71a7ad14-091c-4e8e-a314-022ece01c121"

    # The business this number answers for, until each business's settings come from the database.
    business_name: str = "Bright Pipes Plumbing"
    # A text file of what the receptionist knows about the business: services, hours, area, prices, how booking
    # works. Relative to apps/server. Empty: the demo plumber in voice/prompt.py.
    business_info_file: str = ""
    # Add "this call may be recorded" to the AI notice. Off until calls are actually recorded.
    announce_recording: bool = False
    # The languages the business's callers mostly speak, comma-separated: "en,es" for a US business, "en,hi" for an
    # Indian one. They steer the listening, and the greeting offers the second. The greeting itself is English, so
    # English comes first.
    caller_languages: str = "en,es"
    # Where the business is (ISO code: US, CA, IN…): a caller's number without a country code is a number from here,
    # and its length and read-back follow this country's (voice/prompt.py knows US, CA and IN; others get a general rule).
    business_country: str = "US"
    # The voice's gender: where a language marks the speaker's gender, as Hindi, Arabic and French do, the AI matches it.
    voice_gender: Literal["feminine", "masculine"] = "feminine"
    # Hard cap per call, so a stuck or spam call can't burn minutes.
    max_call_seconds: int = 600

    # After each call where the caller spoke, Claude summarizes it and Resend (resend.com) emails the summary and the
    # transcript to OWNER_EMAIL. Off unless all three are set.
    resend_api_key: str = ""
    owner_email: str = ""
    # The sender, on a domain verified in Resend: "Receptionist <calls@yourdomain.com>". Resend's test sender,
    # onboarding@resend.dev, only delivers to the Resend account's own address.
    summary_from_email: str = ""

    @field_validator("business_country")
    @classmethod
    def country_code(cls, value: str) -> str:
        code = value.strip().upper()
        if len(code) != 2 or not code.isalpha():
            raise ValueError("BUSINESS_COUNTRY must be a two-letter country code, such as US or IN")
        return code

    @field_validator("caller_languages")
    @classmethod
    def english_first(cls, value: str) -> str:
        codes = [code.strip().lower() for code in value.split(",") if code.strip()]
        if not codes or codes[0] != "en":
            raise ValueError("CALLER_LANGUAGES must start with en: the greeting is in English")
        return ",".join(codes)

    @field_validator("business_info_file")
    @classmethod
    def business_info_file_exists(cls, value: str) -> str:
        if value and not (SERVER_DIR / value).is_file():
            raise ValueError(f"BUSINESS_INFO_FILE: no file at {SERVER_DIR / value}")
        return value

    def missing_keys(self, names: tuple[str, ...] = REQUIRED_KEYS) -> list[str]:
        return [name.upper() for name in names if not getattr(self, name)]

    def languages(self) -> list[str]:
        """CALLER_LANGUAGES as codes, English first: ["en", "hi"]."""
        return self.caller_languages.split(",")

    def business_info(self) -> str | None:
        """The business's details from BUSINESS_INFO_FILE, or None when it isn't set."""
        if not self.business_info_file:
            return None
        return (SERVER_DIR / self.business_info_file).read_text(encoding="utf-8").strip()


@lru_cache
def get_settings() -> Settings:
    return Settings()
