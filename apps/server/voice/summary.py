"""After each call, a short summary for the business owner, by email and on WhatsApp.

Claude writes the summary from the transcript, once, in English whatever language the call was in. voice.after_call keeps
it with the saved call and hands it here. Resend (resend.com) emails it with the full transcript below, once
RESEND_API_KEY, OWNER_EMAIL and SUMMARY_FROM_EMAIL are set; and the owner gets it on WhatsApp (voice.whatsapp), once
WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and OWNER_WHATSAPP are set. Either channel failing never stops the other.
"""

import asyncio
from html import escape
from typing import Literal, NamedTuple

from anthropic import AsyncAnthropic
from httpx import AsyncClient
from loguru import logger
from pydantic import BaseModel, Field

from core.config import SUMMARY_KEYS, WHATSAPP_KEYS, Settings
from voice.whatsapp import send_whatsapp, template_message

CALLER, AI = "Caller", "AI"
Turn = tuple[str, str]  # (CALLER or AI, what they said)

RESEND_URL = "https://api.resend.com/emails"
USER_AGENT = "ai-receptionist-server/0.1"  # Resend refuses requests without one
# Every outside call has a deadline. The Anthropic SDK tries a failed request once more, so the summary takes at most
# twice its timeout.
SUMMARY_TIMEOUT_SECONDS = 30.0
EMAIL_TIMEOUT_SECONDS = 15.0
SUMMARY_MAX_TOKENS = 4000


class CallSummary(BaseModel):
    """What Claude reports about a call: the fields of the owner's email."""

    caller_name: str = Field(description='The name the caller gave, in the Latin alphabet, or "Not given".')
    phone_number: str = Field(
        description="The number the caller gave, with a space where it was read back in groups (98765 43210), then"
        ' "(confirmed)" or "(not confirmed)": whether they said yes to the read-back. "Not given" if they gave none.'
    )
    need: str = Field(
        description="What they needed, in one to three sentences, with the details the team needs: the problem, the"
        " address or area, the days or times they asked for."
    )
    urgency: Literal["emergency", "urgent", "normal", "low"] = Field(
        description="emergency: harm or damage is happening now. urgent: the team should act today. normal: the team"
        " should act, not necessarily today. low: nothing for the team to do."
    )
    outcome: Literal["callback", "booking request", "question answered", "spam", "other"] = Field(
        description="callback: they want the team to call them. booking request: they want an appointment or a visit,"
        " which the team must still arrange (the receptionist can't book). question answered: the receptionist answered"
        " and they need nothing more. spam: a sales pitch, a robocall or a prank. other: anything else, such as a wrong"
        " number."
    )
    next_steps: list[str] = Field(
        description="What the team must do next, each a short instruction such as 'Call Ramesh back today to arrange a"
        " visit.' Empty if nothing."
    )
    headline: str = Field(description="The email's subject, under ten words: who called and why. 'Ramesh: kitchen tap leaking'")


def summary_prompt(business_name: str) -> str:
    return f"""You summarize phone calls that an AI receptionist answered for {business_name}. The business owner reads your
summary in an email and decides from it what to do about the call.

- Write in English, even when the call was in Hindi, Hinglish or another language: translate what was said, and write
  names in the Latin alphabet.
- Report only what's in the transcript. Never make up a name, number, address or time.
- The transcript comes from speech-to-text, so a word can be misheard. In a caller's line, a note in brackets such as
  "[digits heard: 98765 43210, 10 digits]" is the system's count of the digits they said: take phone numbers from it.
  If the caller corrected a number, give the corrected one.
- The receptionist can't book appointments or write anything down. It only tells callers the team will call back."""


def as_text(turns: list[Turn]) -> str:
    """The conversation as `Caller:` / `AI:` lines."""
    return "\n".join(f"{who}: {said}" for who, said in turns)


async def summarize(transcript: str, settings: Settings) -> CallSummary:
    """Claude's summary of a call, from its transcript."""
    # None lets the SDK find credentials itself, as the conversation does (voice.call.build_services).
    async with AsyncAnthropic(
        api_key=settings.anthropic_api_key or None, timeout=SUMMARY_TIMEOUT_SECONDS, max_retries=1
    ) as client:
        response = await client.messages.parse(
            model=settings.llm_model,
            max_tokens=SUMMARY_MAX_TOKENS,
            system=summary_prompt(settings.business_name),
            messages=[{"role": "user", "content": f"<transcript>\n{transcript}\n</transcript>"}],
            output_config={"effort": "low"},  # reading one short call needs little thinking
            output_format=CallSummary,
        )
    if response.parsed_output is None:
        raise RuntimeError(f"Claude returned no summary (stop reason: {response.stop_reason})")
    return response.parsed_output


class Email(NamedTuple):
    subject: str
    text: str
    html: str


SUBJECT_PREFIX = {"emergency": "[EMERGENCY] ", "urgent": "[Urgent] "}
URGENCY = {"emergency": "Emergency", "urgent": "Urgent (today)", "normal": "Normal", "low": "Low (nothing to do)"}
OUTCOMES = {
    "callback": "Wants a callback",
    "booking request": "Wants a booking (not booked yet: the team must arrange it)",
    "question answered": "Question answered",
    "spam": "Spam",
    "other": "Other",
}
CHECK_NOTE = "Names and numbers come from speech recognition, so check them when you call back."


def put_through_note(number: str) -> str:
    """What the owner reads about a call the receptionist put through. Nothing tells us whether it was answered."""
    return f"The receptionist put this call through to {number}. If you missed it, call them back."


LABEL_STYLE = "color: #555; padding: 2px 16px 2px 0; vertical-align: top; white-space: nowrap;"
HEADING_STYLE = "font-size: 15px; margin: 24px 0 8px;"


def compose(
    summary: CallSummary | None,
    turns: list[Turn],
    business_name: str,
    caller_id: str | None = None,
    put_through_to: str | None = None,
) -> Email:
    """The owner's email: the summary, then the whole transcript. Without a summary, the transcript alone.
    `put_through_to` is the number the receptionist put the caller through to, if it did."""
    called_from = [("Called from", caller_id)] if caller_id else []
    if summary:
        subject = SUBJECT_PREFIX.get(summary.urgency, "") + summary.headline
        intro = f"A call for {business_name}."
        rows = [
            ("Caller", summary.caller_name),
            ("Number given", summary.phone_number),
            *called_from,
            ("Needs", summary.need),
            ("Urgency", URGENCY[summary.urgency]),
            ("Outcome", OUTCOMES[summary.outcome]),
        ]
        steps = summary.next_steps
    else:
        subject = f"Call for {business_name}" + (f" from {caller_id}" if caller_id else "")
        intro = f"A call for {business_name}. The AI couldn't write a summary of it, so here is the transcript."
        rows, steps = called_from, []
    if put_through_to:
        intro += " " + put_through_note(put_through_to)

    text = [intro, "", *(f"{label}: {value}" for label, value in rows)]
    if steps:
        text += ["", "Next steps:", *(f"- {step}" for step in steps)]
    text += ["", "Transcript:", as_text(turns), "", CHECK_NOTE]

    table = "".join(f'<tr><td style="{LABEL_STYLE}">{escape(label)}</td><td>{escape(value)}</td></tr>' for label, value in rows)
    next_steps = "".join(f"<li>{escape(step)}</li>" for step in steps)
    transcript = "".join(f'<p style="margin: 0 0 6px;"><b>{who}:</b> {escape(said)}</p>' for who, said in turns)
    html = f"""<div style="font-family: sans-serif; font-size: 15px; line-height: 1.5; color: #111;">
<p>{escape(intro)}</p>
<table style="border-collapse: collapse;">{table}</table>
{f'<h3 style="{HEADING_STYLE}">Next steps</h3><ul>{next_steps}</ul>' if steps else ""}
<h3 style="{HEADING_STYLE}">Transcript</h3>
{transcript}
<p style="color: #666; font-size: 13px; margin-top: 24px;">{CHECK_NOTE}</p>
</div>"""
    return Email(subject, "\n".join(text), html)


async def send_email(email: Email, settings: Settings) -> None:
    """Sends `email` to the owner through Resend's API."""
    async with AsyncClient(timeout=EMAIL_TIMEOUT_SECONDS) as http:
        response = await http.post(
            RESEND_URL,
            headers={"Authorization": f"Bearer {settings.resend_api_key}", "User-Agent": USER_AGENT},
            json={
                "from": settings.summary_from_email,
                "to": [settings.owner_email],
                "subject": email.subject,
                "text": email.text,
                "html": email.html,
            },
        )
    if response.is_error:
        raise RuntimeError(f"Resend refused the email ({response.status_code}): {response.text}")


def whatsapp_fields(
    summary: CallSummary, business_name: str, caller_id: str | None = None, put_through_to: str | None = None
) -> dict[str, str]:
    """The named fields of the WhatsApp template (docs/development.md), in the template's order."""
    number = summary.phone_number
    if caller_id and number.startswith("Not given"):
        number = f"{caller_id} (the number they called from)"
    steps = [put_through_note(put_through_to)] if put_through_to else []
    steps += summary.next_steps
    return {
        "business": business_name,
        "caller": summary.caller_name,
        "number": number,
        "need": summary.need,
        "urgency": URGENCY[summary.urgency],
        "next_step": " ".join(steps) or "Nothing to do.",
    }


def caller_spoke(turns: list[Turn]) -> bool:
    return any(who == CALLER for who, _ in turns)


async def summarize_call(turns: list[Turn], settings: Settings, *, label: str = "Call") -> CallSummary | None:
    """Claude's summary of the call, or None when the caller said nothing or Claude failed. Never raises: a failure
    is logged."""
    if not caller_spoke(turns):
        logger.info(f"{label}: the caller said nothing, so no summary")
        return None
    try:
        return await summarize(as_text(turns), settings)
    except Exception:
        logger.exception(f"{label}: couldn't write the call summary")
        return None


async def notify_owner(
    summary: CallSummary | None,
    turns: list[Turn],
    settings: Settings,
    *,
    label: str = "Call",
    caller_id: str | None = None,
    put_through_to: str | None = None,
) -> None:
    """Sends the owner the call's summary by email and on WhatsApp, whichever are set up. Without a summary the email
    carries the transcript alone, so the owner still hears about the caller. Nothing when the caller said nothing.
    A call put through to `put_through_to` says so, in case they missed it. Never raises: every failure is logged."""
    if not caller_spoke(turns):
        return
    email_missing, whatsapp_missing = settings.missing_keys(SUMMARY_KEYS), settings.missing_keys(WHATSAPP_KEYS)
    if email_missing and whatsapp_missing:
        logger.info(
            f"{label}: no summary for the owner; set {', '.join(email_missing)} to email it,"
            f" or {', '.join(whatsapp_missing)} to send it on WhatsApp"
        )
        return
    channels = []
    if not email_missing:
        channels.append(_email(summary, turns, settings, label, caller_id, put_through_to))
    if not whatsapp_missing:
        channels.append(_whatsapp(summary, settings, label, caller_id, put_through_to))
    await asyncio.gather(*channels)


async def _email(
    summary: CallSummary | None,
    turns: list[Turn],
    settings: Settings,
    label: str,
    caller_id: str | None,
    put_through_to: str | None,
):
    try:
        await send_email(compose(summary, turns, settings.business_name, caller_id, put_through_to), settings)
    except Exception:
        logger.exception(f"{label}: couldn't email the call summary")
        return
    logger.info(f"{label}: summary emailed to the owner")


async def _whatsapp(
    summary: CallSummary | None, settings: Settings, label: str, caller_id: str | None, put_through_to: str | None
):
    if summary is None:
        logger.info(f"{label}: no WhatsApp message, because there's no summary to send")
        return
    message = template_message(
        whatsapp_fields(summary, settings.business_name, caller_id, put_through_to),
        to=settings.owner_whatsapp,
        template=settings.whatsapp_template,
        language=settings.whatsapp_template_language,
    )
    try:
        await send_whatsapp(message, settings)
    except Exception:
        logger.exception(f"{label}: couldn't send the call summary on WhatsApp")
        return
    logger.info(f"{label}: summary sent to the owner on WhatsApp")
