// The languages a caller can talk to the receptionist in today: the ones Deepgram Flux, the listening service
// (apps/server/core/config.py), understands. Cartesia, the voice, speaks them all. Mirrors the README; change both
// together. Moving listening to Soniox would add 32 more (README section 2), but that isn't built.

export const languages = {
  "Major global": ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch", "Russian"],
  Asia: ["Japanese", "Hindi"],
} as const;

export type Language = (typeof languages)[keyof typeof languages][number];

export const allLanguages: readonly Language[] = Object.values(languages).flat();

export const languageCount = allLanguages.length;
