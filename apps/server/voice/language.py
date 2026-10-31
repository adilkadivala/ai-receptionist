"""Keep the voice speaking the caller's language.

Deepgram Flux detects the language of every caller turn (TranscriptionFrame.language). The voice
speaks one language per request, so when the caller switches, this sends the voice a settings
update. Claude follows the switch on its own, from the system prompt.

The update is pushed *before* the transcription: the transcription is what starts Claude's reply,
and the voice must have switched before the first words of that reply reach it.
"""

from pipecat.frames.frames import Frame, TranscriptionFrame, TTSUpdateSettingsFrame
from pipecat.processors.frame_processor import FrameDirection, FrameProcessor
from pipecat.services.settings import TTSSettings
from pipecat.transcriptions.language import Language


def base_language(language: Language | str) -> Language | None:
    """`es-MX` -> Language.ES. None for a code Pipecat doesn't know."""
    try:
        return Language(str(language).split("-")[0].lower())
    except ValueError:
        return None


class LanguageFollower(FrameProcessor):
    def __init__(self, initial: Language = Language.EN, **kwargs):
        super().__init__(**kwargs)
        self.language = initial

    async def process_frame(self, frame: Frame, direction: FrameDirection):
        await super().process_frame(frame, direction)
        if isinstance(frame, TranscriptionFrame) and frame.language:
            spoken = base_language(frame.language)
            if spoken and spoken != self.language:
                self.language = spoken
                await self.push_frame(TTSUpdateSettingsFrame(delta=TTSSettings(language=spoken)))
        await self.push_frame(frame, direction)
