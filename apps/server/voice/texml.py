"""Print the TeXML to paste into a Telnyx TeXML bin: `uv run python -m voice.texml`.

Telnyx runs it when someone calls our number: it connects the call's audio, both ways, to our
media-stream WebSocket. With TRANSFER_NUMBER set, it then rings that number whenever the stream stops
without the call being hung up: when the receptionist puts an emergency through (voice.transfer), or
when our server drops the call.
"""

import sys
from xml.sax.saxutils import escape, quoteattr

from core.config import get_settings

# How long the owner's phone rings before the caller hears the fallback line. Mobile voicemail often answers
# after about 25 seconds, and a caller would get that instead.
DIAL_TIMEOUT_SECONDS = 25
# Said once the <Dial> is over, whether the owner answered and hung up or never picked up.
AFTER_DIAL = "Thanks for calling. If we couldn't speak just now, the team will call you back as soon as they can. Goodbye."


def texml(public_host: str, token: str, transfer_number: str = "", caller_id: str = "") -> str:
    """The TeXML for our number. `caller_id` is what the owner's phone shows when a call is put through: the
    business's own number, so they know it comes from the receptionist."""
    url = f"wss://{public_host}/telnyx/media/{token}"
    if not transfer_number:
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url={quoteattr(url)} bidirectionalMode="rtp"></Stream>
  </Connect>
</Response>"""
    # No reconnecting: when we close the stream to put a caller through, Telnyx must move on to the <Dial>, not
    # connect the caller to a new conversation.
    caller_id_attribute = f" callerId={quoteattr(caller_id)}" if caller_id else ""
    return f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url={quoteattr(url)} bidirectionalMode="rtp" enableReconnect="false"></Stream>
  </Connect>
  <Dial{caller_id_attribute} timeout="{DIAL_TIMEOUT_SECONDS}">
    <Number>{escape(transfer_number)}</Number>
  </Dial>
  <Say>{escape(AFTER_DIAL)}</Say>
</Response>"""


if __name__ == "__main__":
    settings = get_settings()
    missing = [name for name in ("PUBLIC_HOST", "MEDIA_STREAM_TOKEN") if not getattr(settings, name.lower())]
    if missing:
        sys.exit(f"Set {' and '.join(missing)} in server/.env first")
    print(texml(settings.public_host, settings.media_stream_token, settings.transfer_number, settings.business_number))
