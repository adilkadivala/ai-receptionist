"""Browser test call: talk to the receptionist from a browser on this computer.

The same listen -> think -> speak conversation as a phone call (voice.call.converse), over WebRTC
instead of a phone line, so it can be tried without a phone network or call charges. The browser
plays the voice through WebRTC, which lets its echo cancellation keep the receptionist from
hearing itself.

Only requests made on this computer get through: when the server is reachable through a tunnel
(ngrok), anyone could otherwise start calls that spend our API minutes.
"""

from html import escape
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request, status
from fastapi.responses import HTMLResponse
from pipecat.transports.base_transport import TransportParams
from pipecat.transports.smallwebrtc.connection import SmallWebRTCConnection
from pipecat.transports.smallwebrtc.request_handler import SmallWebRTCRequest, SmallWebRTCRequestHandler
from pipecat.transports.smallwebrtc.transport import SmallWebRTCTransport

from core.config import VOICE_KEYS, get_settings
from voice.call import converse

BROWSER_IN_SAMPLE_RATE = 16000
BROWSER_OUT_SAMPLE_RATE = 24000
LOCAL_HOSTS = {"localhost", "127.0.0.1", "[::1]"}

PAGE = (Path(__file__).parent / "browser_call.html").read_text(encoding="utf-8")


def this_computer_only(request: Request) -> None:
    """404 unless the request was made on this computer: addressed to localhost, and not forwarded by a proxy."""
    host = request.headers.get("host", "")
    hostname = host if host.startswith("[") and host.endswith("]") else host.rsplit(":", 1)[0]
    if hostname not in LOCAL_HOSTS or "x-forwarded-for" in request.headers:
        raise HTTPException(status.HTTP_404_NOT_FOUND)


router = APIRouter(prefix="/dev/call", dependencies=[Depends(this_computer_only)])
connections = SmallWebRTCRequestHandler()


@router.get("", response_class=HTMLResponse, include_in_schema=False)
def page() -> str:
    return PAGE.replace("{{business}}", escape(get_settings().business_name))


@router.post("/offer", include_in_schema=False)
async def offer(body: dict, background_tasks: BackgroundTasks) -> dict:
    """Answers the browser's WebRTC offer and starts the conversation once the answer is sent."""
    settings = get_settings()
    if missing := settings.missing_keys(VOICE_KEYS):
        raise HTTPException(status.HTTP_503_SERVICE_UNAVAILABLE, f"Set {', '.join(missing)} in server/.env")

    async def start(connection: SmallWebRTCConnection) -> None:
        transport = SmallWebRTCTransport(
            webrtc_connection=connection,
            params=TransportParams(audio_in_enabled=True, audio_out_enabled=True),
        )
        background_tasks.add_task(
            converse,
            transport,
            settings,
            label="Browser test call",
            sample_rate=BROWSER_IN_SAMPLE_RATE,
            out_sample_rate=BROWSER_OUT_SAMPLE_RATE,
        )

    answer = await connections.handle_web_request(SmallWebRTCRequest.from_dict(body), start)
    if answer is None:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No WebRTC answer")
    return answer
