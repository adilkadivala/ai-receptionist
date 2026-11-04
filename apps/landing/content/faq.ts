// FAQ copy: the approved design's questions, with answers the README and architecture doc back.
// Prices and counts are read from @receptionist/product so the answers can't drift from the plans.
import { addOns, allLanguages, formatUsd, languageCount, overagePerMinute } from "@receptionist/product";

function addOnPrice(id: string): string {
  const addOn = addOns.find((item) => item.id === id);
  if (!addOn) throw new Error(`Unknown add-on: ${id}`);
  return `${addOn.from ? "from " : ""}${formatUsd(addOn.price)} a month`;
}

export const faq = [
  {
    question: "Will callers know they're talking to an AI?",
    answer:
      "Yes. Every call opens by saying so, and if a caller asks, it tells them plainly. It never pretends to be a person.",
  },
  {
    question: "Do I need a new phone number?",
    answer: `No. Forward the number you already have, or pick a new local number. Extra numbers are ${addOnPrice("extra-number")}.`,
  },
  {
    question: "What if it doesn't know the answer?",
    answer:
      "It says the team will call back, takes the caller's name and number, and sends them to you by email and WhatsApp as soon as the call ends. Emergencies are put through to you.",
  },
  {
    question: "Can it book into my calendar?",
    answer:
      "Not yet; it's coming soon. Today it takes the booking request, reads the caller's number back, and you call them to confirm a time.",
  },
  {
    question: "What if I go over my minutes?",
    answer: `Calls keep being answered. Extra minutes are ${formatUsd(overagePerMinute)} each, and you're warned when you reach 80% of your plan's minutes.`,
  },
  {
    question: "Which languages does it speak?",
    answer: `${languageCount}: ${allLanguages.slice(0, -1).join(", ")} and ${allLanguages.at(-1)}. It answers in whatever language the caller uses, even when they mix two, like Hindi and English. More languages are coming.`,
  },
];
