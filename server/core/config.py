from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict

REQUIRED_KEYS = ("media_stream_token", "telnyx_api_key", "deepgram_api_key", "cartesia_api_key")


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

    # The business this number answers for. Week 2 replaces this with per-business data.
    business_name: str = "Bright Pipes Plumbing"
    # Hard cap per call, so a stuck or spam call can't burn minutes.
    max_call_seconds: int = 600

    def missing_keys(self) -> list[str]:
        return [name.upper() for name in REQUIRED_KEYS if not getattr(self, name)]


@lru_cache
def get_settings() -> Settings:
    return Settings()
