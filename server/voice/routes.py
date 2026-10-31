"""Telnyx media stream: Telnyx opens this WebSocket for every call to our number.

The URL carries a secret token (set in the TeXML bin, see voice.texml). A connection with the
wrong token is refused before any paid API is touched.
"""

import hmac

from fastapi import APIRouter, WebSocket, status
from loguru import logger
from pipecat.runner.types import TelnyxCallData
from pipecat.runner.utils import parse_telephony_websocket

from core.config import get_settings
from voice.call import run_call

router = APIRouter(prefix="/telnyx")


@router.websocket("/media/{token}")
async def media_stream(websocket: WebSocket, token: str) -> None:
    settings = get_settings()
    expected = settings.media_stream_token
    if not expected or not hmac.compare_digest(token, expected):
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    if missing := settings.missing_keys():
        logger.error(f"Refusing call: set {', '.join(missing)} in server/.env")
        await websocket.close(code=status.WS_1011_INTERNAL_ERROR)
        return

    await websocket.accept()
    provider, call = await parse_telephony_websocket(websocket)
    if provider != "telnyx" or not isinstance(call, TelnyxCallData):
        logger.warning(f"Refusing a {provider} stream on the Telnyx endpoint")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    await run_call(websocket, call, settings)
