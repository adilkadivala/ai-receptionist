// FAQ copy: the approved design's questions, with answers the README and architecture doc back.
// Prices and counts are read from @receptionist/product so the answers can't drift from the plans.
import { addOns, formatUsd, languageCount, overagePerMinute } from "@receptionist/product";

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
    answer: "It takes a message and emails you straight away, or transfers the caller to a person if you set that up.",
  },
  {
    question: "Can it book into my calendar?",
    answer: "Yes. It checks your availability, reads the details back to the caller, and only then books.",
  },
  {
    question: "What if I go over my minutes?",
    answer: `Calls keep being answered. Extra minutes are ${formatUsd(overagePerMinute)} each, and you're warned when you reach 80% of your plan's minutes.`,
  },
  {
    question: "Which languages does it speak?",
    answer: `${languageCount}, including English, Spanish, Arabic, Hindi, Chinese and Japanese. It answers in whatever language the caller uses, even when they mix two.`,
  },
];
