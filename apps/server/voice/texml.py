"""Print the TeXML to paste into a Telnyx TeXML bin: `uv run python -m voice.texml`.

Telnyx runs it when someone calls our number: it connects the call's audio, both ways, to our
media-stream WebSocket.
"""

import sys
from xml.sax.saxutils import quoteattr

from core.config import get_settings


def texml(public_host: str, token: str) -> str:
    url = f"wss://{public_host}/telnyx/media/{token}"
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url={quoteattr(url)} bidirectionalMode="rtp"></Stream>
  </Connect>
</Response>"""


if __name__ == "__main__":
    settings = get_settings()
    missing = [name for name in ("PUBLIC_HOST", "MEDIA_STREAM_TOKEN") if not getattr(settings, name.lower())]
    if missing:
        sys.exit(f"Set {' and '.join(missing)} in server/.env first")
    print(texml(settings.public_host, settings.media_stream_token))
