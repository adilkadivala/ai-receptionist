"""Spoken phone numbers, counted and grouped in code.

The transcript spells digits out ("seven eight five...", "सात आठ...", "double five"), and Claude miscounts long runs
of them: in a test it heard ten digits as eleven, and read them back in one breath. So every caller turn with a run of
digits gets a note with the digits, grouped the way they're said where the business is, and how many there are. The
prompt tells Claude to read numbers back from it and trust its count.
"""

import re
from typing import NamedTuple

from pipecat.frames.frames import Frame, TranscriptionFrame
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor

DIGIT_WORDS = {
    # English
    "zero": "0", "oh": "0", "one": "1", "two": "2", "three": "3", "four": "4",
    "five": "5", "six": "6", "seven": "7", "eight": "8", "nine": "9",
    # Hindi, with the spellings speech-to-text produces
    "शून्य": "0", "ज़ीरो": "0", "जीरो": "0", "एक": "1", "दो": "2", "तीन": "3", "चार": "4",
    "पांच": "5", "पाँच": "5", "छह": "6", "छः": "6", "छे": "6", "सात": "7", "आठ": "8", "नौ": "9",
}  # fmt: skip
REPEATS = {"double": 2, "triple": 3, "डबल": 2, "ट्रिपल": 3}
PLUS = {"+", "plus", "प्लस"}
DEVANAGARI_NUMERALS = str.maketrans("०१२३४५६७८९", "0123456789")

# Fewer digits than this in a row isn't a phone number ("एक बार", "two o'clock").
MIN_DIGITS = 6


class NumberFormat(NamedTuple):
    code: str  # the country code
    groups: tuple[int, ...]  # how a local number is said: (3, 3, 4) is "555 010 4412"


# Local numbers have ten digits in all three.
NUMBER_FORMATS = {
    "US": NumberFormat("1", (3, 3, 4)),
    "CA": NumberFormat("1", (3, 3, 4)),
    "IN": NumberFormat("91", (5, 5)),
}


def grouped(number: str, country: str) -> str:
    """`number` split the way it's said in `country`, when it's a local number or one with that country's code.

    >>> grouped("+919876543210", "IN")
    '+91 98765 43210'
    """
    fmt = NUMBER_FORMATS.get(country)
    local = number.removeprefix(f"+{fmt.code}") if fmt else number
    if not fmt or local.startswith("+") or len(local) != sum(fmt.groups):
        return number
    parts, start = [], 0
    for size in fmt.groups:
        parts.append(local[start : start + size])
        start += size
    return " ".join(([f"+{fmt.code}"] if number.startswith("+") else []) + parts)


# Latin words and numbers, and Devanagari words (U+0900 to U+097F, with their vowel signs).
TOKENS = re.compile("\\+|[a-z0-9]+|[\u0900-\u097f]+")


def spoken_numbers(text: str) -> list[str]:
    """The runs of at least six digits said in `text`, as digit strings, with "+" first after "plus".

    >>> spoken_numbers("my number is plus nine one double five six two three four one zero")
    ['+9155623410']
    """
    runs: list[str] = []
    digits, plus, repeat = "", False, 1

    def finish() -> None:
        nonlocal digits, plus
        if len(digits) >= MIN_DIGITS:
            runs.append(("+" if plus else "") + digits)
        digits, plus = "", False

    for token in TOKENS.findall(text.lower()):
        token = token.translate(DEVANAGARI_NUMERALS)
        if token in PLUS:
            finish()
            plus = True
        elif token in REPEATS:
            repeat = REPEATS[token]
        elif token.isascii() and token.isdigit():
            digits += token
            repeat = 1
        elif token in DIGIT_WORDS:
            digits += DIGIT_WORDS[token] * repeat
            repeat = 1
        else:
            finish()
            repeat = 1
    finish()
    return runs


def digits_note(text: str, country: str = "US") -> str:
    """The note added to a caller turn that has a phone number in it, or "" when it has none."""
    runs = spoken_numbers(text)
    if not runs:
        return ""
    heard = "; ".join(f"{grouped(run, country)}, {len(run.lstrip('+'))} digits" for run in runs)
    return f" [digits heard: {heard}]"


class NumberNoter(FrameProcessor):
    """Adds the digits note to each finished caller turn, between the listening and Claude."""

    def __init__(self, country: str = "US", **kwargs):
        super().__init__(**kwargs)
        self.country = country

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        if isinstance(frame, TranscriptionFrame) and (note := digits_note(frame.text, self.country)):
            frame.text += note
        await self.push_frame(frame, direction)
