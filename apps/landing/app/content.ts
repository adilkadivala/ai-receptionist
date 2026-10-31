// Landing page copy. Plans and languages mirror the README; change both together.

export const segments = [
  {
    name: "Small businesses",
    examples: "Plumbers, cleaners, salons, shops, auto repair",
    does: "Answers questions, takes messages, books jobs and emails you a summary of every call.",
  },
  {
    name: "Business people",
    examples: "Founders, executives, consultants, lawyers",
    does: "Screens calls, books meetings into your calendar and can answer in your own voice.",
  },
  {
    name: "Busy hotels",
    examples: "Independent hotels and chains",
    does: "Answers guests 24/7 in their own language and transfers to the front desk when needed.",
  },
  {
    name: "Hospitals and clinics",
    examples: "Appointments, departments, refills",
    does: "Books and moves appointments, routes calls to departments and never gives medical advice.",
  },
  {
    name: "Mid-size and large companies",
    examples: "Chains, multi-branch firms, call centers",
    does: "Routes calls to the right branch or team and covers after hours and overflow.",
  },
] as const;

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

export const languageCount = Object.values(languages).reduce((total, group) => total + group.length, 0);

export const plans = [
  { name: "Starter", price: 29, minutes: 100, for: "One business, one number" },
  { name: "Pro", price: 79, minutes: 350, for: "Busy small businesses", featured: true },
  { name: "Business", price: 149, minutes: 700, for: "Several numbers and calendars" },
] as const;

export const included = [
  `All ${languageCount} languages`,
  "Appointment booking",
  "Transfer to a person",
  "Spam blocking",
  "Summary and transcript of every call",
];

export const overagePerMinute = 0.2;
