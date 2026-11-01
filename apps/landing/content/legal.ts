// Draft placeholders for the legal pages. A lawyer replaces these before launch; until then they say only
// what the README and docs/architecture.md support, and "To be written" everywhere else.
import { formatUsd, overagePerMinute } from "@receptionist/product";

export type LegalSection = { heading: string; paragraphs: string[] };

const toBeWritten = "To be written.";

export const privacySections: LegalSection[] = [
  {
    heading: "What we collect",
    paragraphs: [
      "From businesses: account details, such as your name, email address and the information about your business you give the receptionist.",
      "From callers: the phone number they call from, the call audio while the call is in progress, and the transcript and summary of the call.",
    ],
  },
  {
    heading: "Who processes it for us",
    paragraphs: [
      "Telnyx (phone lines), Soniox (speech to text), Anthropic (the Claude language model), Cartesia (the receptionist's voice), Resend (email), Dodo Payments (billing) and Amazon Web Services (hosting).",
    ],
  },
  {
    heading: "How long we keep it",
    paragraphs: [
      "Each business sets how long its transcripts are kept. The default is 90 days, and it is shorter in HIPAA mode.",
    ],
  },
  {
    heading: "Where it is stored",
    paragraphs: ["Data is stored in the region chosen when the business signs up, and it doesn't move."],
  },
  {
    heading: "Deleting your data",
    paragraphs: [
      "A business, or a caller, can ask us to delete their data. We then delete it along with anything made from it, such as summaries.",
    ],
  },
  { heading: "Cookies", paragraphs: [toBeWritten] },
  { heading: "Your rights by country", paragraphs: [toBeWritten] },
];

export const termsSections: LegalSection[] = [
  {
    heading: "The service",
    paragraphs: [
      "An AI receptionist that answers your business's phone calls, books appointments, takes messages, transfers calls to a person and emails you a summary of each call.",
    ],
  },
  {
    heading: "Plans and billing",
    paragraphs: [
      `Self-serve plans are billed monthly and include a set number of call minutes. Extra minutes are ${formatUsd(overagePerMinute)} each.`,
      "Contracts for hotels, hospitals and large companies are priced per minute and billed by invoice.",
    ],
  },
  {
    heading: "Telling callers it's an AI",
    paragraphs: ["Every call opens with a notice that the caller is speaking with an AI. You may not turn this off."],
  },
  {
    heading: "Not for emergencies or medical advice",
    paragraphs: [
      "The receptionist never gives medical advice. When a caller describes an emergency, it tells them to hang up and call the emergency number, or transfers them to a person.",
    ],
  },
  { heading: "Acceptable use", paragraphs: [toBeWritten] },
  { heading: "Cancelling", paragraphs: [toBeWritten] },
  { heading: "Liability", paragraphs: [toBeWritten] },
  { heading: "Changes to these terms", paragraphs: [toBeWritten] },
];
