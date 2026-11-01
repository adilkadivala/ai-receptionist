// The languages both Soniox (listening) and Cartesia (speaking) cover. Mirrors the README; change both together.

export const languages = {
  "Major global": ["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch", "Russian"],
  Asia: [
    "Chinese",
    "Japanese",
    "Korean",
    "Hindi",
    "Urdu",
    "Bengali",
    "Tamil",
    "Telugu",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Marathi",
    "Punjabi",
    "Thai",
    "Vietnamese",
    "Indonesian",
    "Malay",
    "Tagalog",
  ],
  "Middle East": ["Arabic", "Hebrew", "Turkish"],
  Europe: [
    "Polish",
    "Ukrainian",
    "Czech",
    "Slovak",
    "Romanian",
    "Bulgarian",
    "Croatian",
    "Hungarian",
    "Greek",
    "Swedish",
    "Danish",
    "Norwegian",
    "Finnish",
  ],
} as const;

export type Language = (typeof languages)[keyof typeof languages][number];

export const allLanguages: readonly Language[] = Object.values(languages).flat();

export const languageCount = allLanguages.length;
