import pytest
from fastapi.testclient import TestClient

from core.config import Settings

TOKEN = "test-stream-token"


def make_settings(**overrides) -> Settings:
    """Settings that ignore server/.env, so tests don't depend on (or touch) real keys."""
    values = {
        "public_host": "example.ngrok-free.app",
        "media_stream_token": TOKEN,
        "telnyx_api_key": "telnyx-test",
        "deepgram_api_key": "deepgram-test",
        "cartesia_api_key": "cartesia-test",
        "anthropic_api_key": "anthropic-test",
    }
    return Settings(_env_file=None, **{**values, **overrides})


@pytest.fixture
def use_settings(monkeypatch):
    def apply(settings: Settings) -> Settings:
        monkeypatch.setattr("api.main.get_settings", lambda: settings)
        monkeypatch.setattr("voice.routes.get_settings", lambda: settings)
        return settings

    return apply


@pytest.fixture
def client() -> TestClient:
    from api.main import app

    return TestClient(app)
