import pytest
from starlette.websockets import WebSocketDisconnect

from tests.conftest import TOKEN, make_settings
from voice.texml import texml


def test_health_lists_missing_keys(client, use_settings):
    use_settings(make_settings(deepgram_api_key="", media_stream_token=""))
    assert client.get("/api/health").json() == {"ok": True, "missing": ["MEDIA_STREAM_TOKEN", "DEEPGRAM_API_KEY"]}


def test_health_ready(client, use_settings):
    use_settings(make_settings())
    assert client.get("/api/health").json() == {"ok": True, "missing": []}


def test_media_stream_refuses_wrong_token(client, use_settings):
    use_settings(make_settings())
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect("/telnyx/media/not-the-token"):
            pass
    assert exc.value.code == 1008


def test_media_stream_refuses_when_no_token_configured(client, use_settings):
    use_settings(make_settings(media_stream_token=""))
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect("/telnyx/media/anything"):
            pass
    assert exc.value.code == 1008


def test_media_stream_refuses_when_keys_missing(client, use_settings):
    use_settings(make_settings(cartesia_api_key=""))
    with pytest.raises(WebSocketDisconnect) as exc:
        with client.websocket_connect(f"/telnyx/media/{TOKEN}"):
            pass
    assert exc.value.code == 1011


def test_media_stream_refuses_other_providers(client, use_settings):
    use_settings(make_settings())
    twilio_start = {"event": "start", "start": {"streamSid": "MZ1", "callSid": "CA1"}}
    with client.websocket_connect(f"/telnyx/media/{TOKEN}") as ws:
        ws.send_json({"event": "connected"})
        ws.send_json(twilio_start)
        with pytest.raises(WebSocketDisconnect) as exc:
            ws.receive_text()
    assert exc.value.code == 1008


def test_texml_points_telnyx_at_the_media_stream():
    xml = texml("abc.ngrok-free.app", "s3cret")
    assert 'url="wss://abc.ngrok-free.app/telnyx/media/s3cret"' in xml
    assert 'bidirectionalMode="rtp"' in xml
    assert xml.startswith('<?xml version="1.0" encoding="UTF-8"?>')
    assert "<Dial" not in xml and "enableReconnect" not in xml  # no transfer number: the call ends with the stream


def test_texml_rings_the_transfer_number_once_the_stream_stops():
    xml = texml("calls.example.com", "s3cret", transfer_number="+919876543210", caller_id="+16175550142")
    assert 'enableReconnect="false"' in xml  # closing the stream must reach the <Dial>, not a new conversation
    assert xml.index("</Connect>") < xml.index('<Dial callerId="+16175550142" timeout="25">') < xml.index("<Say>")
    assert "<Number>+919876543210</Number>" in xml
    assert 'url="wss://calls.example.com/telnyx/media/s3cret"' in xml
