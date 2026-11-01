// Example calls shown on the landing page. They're illustrations, always labeled "Example", never real customers.

export type TranscriptTurn = {
  speaker: "ai" | "caller";
  /** Time into the call, e.g. "00:05". */
  at?: string;
  text: string;
  /** BCP 47 tag when the line isn't plain English, e.g. "hi-Latn" for Hindi written in Latin letters. */
  lang?: string;
  translation?: string;
};

// The hero: an after-hours call to a small business, from greeting to booking.
export const exampleCall = {
  business: "Rivera Plumbing",
  receivedAt: "Tue, 11:42 pm",
  turns: [
    {
      speaker: "ai",
      at: "00:00",
      text: "Thanks for calling Rivera Plumbing. I'm the AI receptionist. How can I help?",
    },
    {
      speaker: "caller",
      at: "00:05",
      text: "My kitchen sink is leaking under the cabinet. Can someone come tomorrow?",
    },
    { speaker: "ai", at: "00:11", text: "I can book that. Tomorrow I have 10 am or 2 pm. Which suits you?" },
    { speaker: "caller", at: "00:16", text: "Ten, please. It's Maria Lopez." },
    { speaker: "ai", at: "00:20", text: "Let me check: Maria Lopez, tomorrow at 10 am, on 555-0142. Shall I book it?" },
    { speaker: "caller", at: "00:26", text: "Yes, thanks." },
  ] satisfies TranscriptTurn[],
  summary: [
    { label: "Booked", value: "Wed, 10:00 am" },
    { label: "Job", value: "Leak under the kitchen sink" },
    { label: "Caller", value: "Maria Lopez · 555-0142" },
  ],
};

// The languages section: a caller who mixes Hindi and English in one sentence.
export const mixedLanguageCall = {
  label: "Hindi and English in one call",
  turns: [
    {
      speaker: "caller",
      lang: "hi-Latn",
      text: "Kya kal subah appointment mil sakta hai? Around ten?",
      translation: "Can I get an appointment tomorrow morning? Around ten?",
    },
    {
      speaker: "ai",
      lang: "hi-Latn",
      text: "Haan, kal subah 10 baje ka slot free hai. Aapka naam bata dijiye?",
      translation: "Yes, 10 am tomorrow is free. May I have your name?",
    },
  ] satisfies TranscriptTurn[],
};
