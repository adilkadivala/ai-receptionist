"""WhatsApp messages to the business owner, through Meta's WhatsApp Cloud API.

A business may only message someone first with a template Meta has approved; free-form text is allowed only within 24
hours of that person messaging the business. So the call summary goes out as a utility template with named fields
(docs/development.md has its text, to submit in WhatsApp Manager). voice.summary decides what goes in the fields; this
module only sends.
"""

import re

from httpx import AsyncClient

from core.config import Settings

# Pinned, so a new Graph API version can't change what we send.
GRAPH_URL = "https://graph.facebook.com/v26.0/{phone_number_id}/messages"
WHATSAPP_TIMEOUT_SECONDS = 15.0

# Template fields are one line each. Meta doesn't document a per-field limit that we found, but the whole body may be
# at most 1,024 characters, so long fields are cut.
FIELD_LIMIT = 300


def one_line(value: str, limit: int = FIELD_LIMIT) -> str:
    """`value` on one line, its runs of spaces, tabs and newlines made single spaces, cut to `limit` characters."""
    text = re.sub(r"\s+", " ", value).strip()
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def template_message(fields: dict[str, str], to: str, template: str, language: str) -> dict:
    """The request body that sends the approved template `template` to `to` (E.164, "+91..."), its named fields
    filled from `fields`."""
    return {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": to,
        "type": "template",
        "template": {
            "name": template,
            "language": {"code": language},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "parameter_name": name, "text": one_line(value)} for name, value in fields.items()
                    ],
                }
            ],
        },
    }


async def send_whatsapp(message: dict, settings: Settings) -> str:
    """Sends `message` from the business's WhatsApp number and returns Meta's message ID. Raises when Meta refuses it,
    with Meta's error code: 132001 means the template isn't approved (yet), 190 that the token has expired."""
    async with AsyncClient(timeout=WHATSAPP_TIMEOUT_SECONDS) as http:
        response = await http.post(
            GRAPH_URL.format(phone_number_id=settings.whatsapp_phone_number_id),
            headers={"Authorization": f"Bearer {settings.whatsapp_token}"},
            json=message,
        )
    if response.is_error:
        try:
            error = response.json()["error"]
            detail = f"error {error.get('code')}: {error.get('message')} {error.get('error_data', {}).get('details', '')}"
        except (ValueError, KeyError, TypeError, AttributeError):
            detail = response.text
        raise RuntimeError(f"WhatsApp refused the message ({response.status_code}, {detail.strip()})")
    return response.json()["messages"][0]["id"]
