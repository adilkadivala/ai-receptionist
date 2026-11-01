// FAQ copy. Prices and counts are read from @receptionist/product so the answers can't drift from the plans.
import { addOns, contractFromPerMinute, formatUsd, languageCount, overagePerMinute } from "@receptionist/product";

function addOnPrice(id: string): string {
  const addOn = addOns.find((item) => item.id === id);
  if (!addOn) throw new Error(`Unknown add-on: ${id}`);
  return `${addOn.from ? "from " : ""}${formatUsd(addOn.price)} a month`;
}

export const faq = [
  {
    question: "Will callers know they're talking to an AI?",
    answer:
      "Yes. Every call opens with a short notice that the caller is speaking with an AI receptionist, and if anyone asks, it says so plainly. It never pretends to be a person.",
  },
  {
    question: "Can I keep my business number?",
    answer: `Yes. Forward calls from the number you already have, or get a new local number from us. Extra numbers are ${addOnPrice("extra-number")}.`,
  },
  {
    question: "What happens when a caller needs a real person?",
    answer:
      "It transfers the call to you or whoever you choose. Urgent calls go through straight away, and if something goes wrong mid-call it takes the caller's number for a callback.",
  },
  {
    question: "Which languages does it speak?",
    answer: `${languageCount} languages, all included in every plan. It hears which language the caller speaks and answers in it, and keeps up when they mix two, like Hindi and English or Arabic and English.`,
  },
  {
    question: "How does it book appointments?",
    answer:
      "It checks your calendar for free times and offers them to the caller. Before booking, it reads back the name, time and phone number so mistakes get caught on the call, not later.",
  },
  {
    question: "What if I use more minutes than my plan includes?",
    answer: `Extra minutes are ${formatUsd(overagePerMinute)} each, or you can move to a plan with more minutes from your dashboard.`,
  },
  {
    question: "Can it answer in my own voice?",
    answer: `Yes, with the "Your own voice" add-on (${addOnPrice("voice-clone")}). We only make the voice clone after you record your consent.`,
  },
  {
    question: "Is it suitable for hospitals and clinics?",
    answer:
      "Yes, on a contract. It books, moves and cancels appointments, routes calls to departments and takes prescription-refill messages. It never gives medical advice. US hospitals get HIPAA mode: only providers that sign a business associate agreement, no call recordings, shorter retention and an audit log.",
  },
  {
    question: "How is pricing different for large organizations?",
    answer: `Hotels, hospitals and large companies pay per minute, from ${formatUsd(contractFromPerMinute)}, billed by invoice. Connecting your booking or scheduling system has a one-time setup fee.`,
  },
];
