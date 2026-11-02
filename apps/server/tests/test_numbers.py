from pipecat.frames.frames import TranscriptionFrame
from pipecat.tests.utils import run_test

from voice.numbers import NumberNoter, digits_note, grouped, spoken_numbers


def test_english_digit_words():
    assert spoken_numbers("my phone number is seven eight five six nine four three two one zero") == ["7856943210"]


def test_hinglish_with_hindi_digits_and_a_country_code():
    assert spoken_numbers("मेरा number है plus nine one सात आठ पाँच छह नौ four three two one zero") == ["+917856943210"]


def test_double_and_numerals():
    assert spoken_numbers("it's 98765 double four three two one") == ["9876544321"]
    assert spoken_numbers("नंबर है ९८७६५४३२१०") == ["9876543210"]


def test_short_runs_and_ordinary_words_are_not_numbers():
    assert spoken_numbers("एक बार, I'll be there at two, oh one more thing") == []


def test_the_note_counts_and_groups_the_digits():
    assert digits_note("seven eight five six nine four three two one", "IN") == " [digits heard: 785694321, 9 digits]"
    assert digits_note("seven eight five six nine four three two one zero", "IN") == (" [digits heard: 78569 43210, 10 digits]")
    assert digits_note("plus nine one nine eight seven six five four three two one zero", "IN") == (
        " [digits heard: +91 98765 43210, 12 digits]"
    )
    assert digits_note("five five five zero one zero four four one two") == " [digits heard: 555 010 4412, 10 digits]"
    assert digits_note("मेरा नाम अहमद है") == ""


def test_numbers_from_elsewhere_stay_ungrouped():
    assert grouped("+447700900123", "IN") == "+447700900123"
    assert grouped("9876543210", "AE") == "9876543210"


async def test_caller_turns_get_the_note():
    turn = TranscriptionFrame(text="number is seven eight five six nine four three two one zero", user_id="", timestamp="")
    down, _ = await run_test(NumberNoter("IN"), frames_to_send=[turn], expected_down_frames=[TranscriptionFrame])
    assert down[0].text.endswith("[digits heard: 78569 43210, 10 digits]")
