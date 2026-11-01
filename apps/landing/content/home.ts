// Landing page copy, one block per section. Plans, prices and languages come from @receptionist/product.

export const hero = {
  eyebrow: "AI phone receptionist",
  title: "Every call answered, day and night",
  description:
    "It books appointments, takes messages, puts urgent calls through to you and emails you a summary of every call. For a one-person plumbing business or a large hospital.",
};

export const steps = [
  {
    title: "Connect your phone line",
    description: "Forward calls from the number you already have, or get a new local number from us.",
  },
  {
    title: "Tell it about your business",
    description:
      "Add your hours, services, prices and the questions callers usually ask. Connect your calendar so it can book.",
  },
  {
    title: "It answers, books and reports",
    description:
      "It answers in the caller's language, books appointments, takes messages and puts urgent calls through. A summary of each call lands in your inbox.",
  },
];

export const features = [
  {
    id: "booking",
    title: "Books appointments",
    description:
      "Checks your calendar, offers free times, and reads back the name, time and phone number before it books.",
  },
  {
    id: "transfer",
    title: "Transfers to a person",
    description: "Urgent calls and anything it can't handle go straight to you or your team.",
  },
  {
    id: "messages",
    title: "Takes messages",
    description: "Gets the caller's name, number and what they need, so you can call back with the answer.",
  },
  {
    id: "summaries",
    title: "Summaries and transcripts",
    description: "After every call you get an email saying what happened. The full transcript is in your dashboard.",
  },
  {
    id: "spam",
    title: "Blocks spam",
    description: "Robocalls and spam are blocked before the AI picks up, so your inbox only has real callers.",
  },
  {
    id: "languages",
    title: "Speaks your callers' languages",
    description: "Answers in the language the caller speaks and keeps up when they mix two in one sentence.",
  },
  {
    id: "fallback",
    title: "Never leaves a caller hanging",
    description:
      "If something goes wrong mid-call, it takes the caller's number for a callback or puts them through to you.",
  },
  {
    id: "voice",
    title: "Your own voice",
    description: "It can answer in your cloned voice. We make the clone only after you record your consent.",
    addOnId: "voice-clone",
  },
] as const;

export type FeatureId = (typeof features)[number]["id"];

export const trust = [
  {
    id: "disclosure",
    title: "Callers always know it's an AI",
    description:
      "Every call opens with a short notice that the caller is speaking with an AI receptionist. If anyone asks, it says so plainly. It never pretends to be a person.",
  },
  {
    id: "medical",
    title: "No medical advice, and emergencies go to a person",
    description:
      "A safety check outside the AI reviews every sentence before it's spoken. When a caller describes an emergency, it tells them to hang up and call the emergency number, or transfers them to a person.",
  },
  {
    id: "hipaa",
    title: "HIPAA mode for hospitals",
    description:
      "For US hospitals, calls run only through providers that sign a business associate agreement, with no call recordings, shorter retention and an audit log of who viewed what.",
  },
  {
    id: "region",
    title: "Choose where your data lives",
    description:
      "On a contract, you choose the region your data is stored in. It's set when you sign up and doesn't move.",
  },
] as const;

export type TrustId = (typeof trust)[number]["id"];

export const trustAlso = [
  "Encrypted in transit and at rest",
  "Retention set per business, 90 days by default",
  "A caller's data deleted on request, including anything made from it",
  "Every booking, transfer and message written to an audit log",
];

// The large-contract card under the plans.
export const contractFeatures = [
  "Billed by bank invoice",
  "Many calls at the same time",
  "Routing to the right branch or department",
  "Connects to your booking or scheduling system",
  "Your choice of data region",
  "HIPAA mode for US hospitals",
];
