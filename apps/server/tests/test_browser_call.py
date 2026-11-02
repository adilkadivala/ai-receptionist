from fastapi.testclient import TestClient

from tests.conftest import make_settings


def local_client() -> TestClient:
    from api.main import app

    return TestClient(app, base_url="http://localhost:8010")


def test_page_opens_on_this_computer(use_settings):
    use_settings(make_settings(business_name="Bright & Pipes"))
    response = local_client().get("/dev/call")
    assert response.status_code == 200
    assert "Bright &amp; Pipes" in response.text
    assert "{{business}}" not in response.text


def test_hidden_from_other_hosts(client, use_settings):
    use_settings(make_settings())
    assert client.get("/dev/call", headers={"host": "abc.ngrok-free.app"}).status_code == 404
    assert client.post("/dev/call/offer", json={}, headers={"host": "abc.ngrok-free.app"}).status_code == 404


def test_hidden_when_forwarded_by_a_tunnel(use_settings):
    # ngrok can keep the Host header as localhost, but it always adds X-Forwarded-For.
    use_settings(make_settings())
    response = local_client().get("/dev/call", headers={"x-forwarded-for": "203.0.113.7"})
    assert response.status_code == 404


def test_offer_needs_the_listening_and_voice_keys(use_settings):
    use_settings(make_settings(cartesia_api_key="", telnyx_api_key="", media_stream_token=""))
    response = local_client().post("/dev/call/offer", json={"sdp": "v=0", "type": "offer"})
    assert response.status_code == 503
    assert response.json()["detail"] == "Set CARTESIA_API_KEY in server/.env"
