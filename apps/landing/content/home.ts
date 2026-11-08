// Landing page copy, one block per section, from the approved "Signal" design (docs/design/landing.dc.html).
// Plans, prices and languages come from @receptionist/product.
import { contractFromPerMinute, formatUsd, languageCount, overagePerMinute } from "@receptionist/product";

export const hero = {
  badge: "New",
  announcement: `${languageCount} languages from day one`,
  title: "Every call answered.",
  subtitle: `Day or night, in ${languageCount} languages.`,
  description:
    "An AI receptionist that picks up 24/7, answers questions about your business, takes messages and booking requests, and puts urgent calls through to you. For a one-person plumbing business or a large hospital.",
};

export const builtFor = {
  title: "Built for businesses of every size",
  kinds: [
    { id: "trades", name: "Trades" },
    { id: "salons", name: "Salons" },
    { id: "clinics", name: "Clinics" },
    { id: "law", name: "Law firms" },
    { id: "hotels", name: "Hotels" },
    { id: "hospitals", name: "Hospitals" },
    { id: "branches", name: "Multi-branch" },
  ],
} as const;

export type BusinessKind = (typeof builtFor.kinds)[number]["id"];

export const product = {
  eyebrow: "See it work",
  title: "Hear it answer, in your callers' language",
  description: "An example call, played live. Pick a language and watch it book, transfer or take a message.",
};

export const steps = [
  { title: "Keep your number", description: "Forward the calls you already get, or pick a new local number." },
  {
    title: "Tell it about your business",
    description: "Services, prices, opening hours, common questions and who should get urgent calls.",
  },
  {
    title: "It answers every call",
    description: "It answers, puts emergencies through and sends you a summary of every call, around the clock.",
  },
];

export const languagesCopy = {
  title: "Your callers' language, from day one",
  description:
    "It hears which language the caller speaks and answers in it, even when they mix two, like Hindi and English. Every plan includes every language.",
};

export const pricingCopy = {
  title: "Simple plans. Every language included.",
  description: `Extra minutes are ${formatUsd(overagePerMinute)} each. Transfers to a person and call summaries come with every plan.`,
};

export const contract = {
  title: "Hotels, hospitals and large companies",
  description: `From ${formatUsd(contractFromPerMinute)} a minute, billed by invoice. Department routing, HIPAA mode and your choice of data region are coming soon.`,
};

export const trust = [
  { id: "disclosure", title: "Always says it's an AI", description: "Every call opens by saying so." },
  {
    id: "emergencies",
    title: "Emergencies go to a person",
    description: "It never gives medical advice and transfers urgent calls.",
  },
  {
    id: "hipaa",
    title: "HIPAA mode for healthcare",
    description: "Only vendors with a signed agreement, short retention.",
    soon: true,
  },
  {
    id: "region",
    title: "Your data region",
    description: "Large contracts choose where their data is stored.",
    soon: true,
  },
] as const;

export type TrustId = (typeof trust)[number]["id"];

export const finalCta = {
  title: "Stop missing calls tonight.",
  description:
    "Book a demo. We set up your receptionist from your website, you forward your number, and it picks up the next call.",
};

export const footer = {
  tagline: `Every call answered, in ${languageCount} languages.`,
  note: "Callers are always told they're speaking with an AI.",
};
