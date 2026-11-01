import { check, type Errors, isE164 } from "../../lib/validation";
import { type AgentSettings, weekdays } from "./types";

export const limits = {
  greeting: 300,
  businessName: 100,
  businessInfo: 2000,
  transferNumbers: 5,
  faqs: 50,
  question: 200,
  answer: 1000,
};

export function validateAgentSettings(settings: AgentSettings): Errors {
  const errors: Errors = {};

  check(errors, "greeting", settings.greeting.trim().length < 10, "Write a greeting of at least 10 characters.");
  check(
    errors,
    "greeting",
    settings.greeting.length > limits.greeting,
    `Keep the greeting under ${limits.greeting} characters, so callers get to speak quickly.`,
  );

  check(errors, "business_name", !settings.business_name.trim(), "Enter your business's name.");
  check(
    errors,
    "business_name",
    settings.business_name.length > limits.businessName,
    `Use ${limits.businessName} characters or fewer.`,
  );
  check(
    errors,
    "business_info",
    !settings.business_info.trim(),
    "Tell the receptionist what you do; it's what it answers from.",
  );
  check(
    errors,
    "business_info",
    settings.business_info.length > limits.businessInfo,
    `Use ${limits.businessInfo} characters or fewer. Put the rest in FAQ entries.`,
  );
  check(errors, "time_zone", !settings.time_zone, "Choose your time zone.");

  for (const day of weekdays) {
    const { open, from, to } = settings.hours[day];
    check(errors, `hours.${day}`, open && (!from || !to), "Enter opening and closing times.");
    check(errors, `hours.${day}`, open && from >= to, "Closing time must be after opening time.");
  }

  check(errors, "languages", settings.languages.length === 0, "Choose at least one language.");
  check(errors, "voice_id", !settings.voice_id, "Choose a voice.");

  check(
    errors,
    "transfer_numbers",
    settings.transfer_numbers.length > limits.transferNumbers,
    `Add up to ${limits.transferNumbers} numbers.`,
  );
  const seen = new Set<string>();
  settings.transfer_numbers.forEach((transfer, index) => {
    check(errors, `transfer_numbers.${index}.label`, !transfer.label.trim(), "Say who picks up.");
    check(errors, `transfer_numbers.${index}.e164`, !transfer.e164, "Enter a phone number.");
    check(
      errors,
      `transfer_numbers.${index}.e164`,
      !isE164(transfer.e164),
      "Use the international format with country code, like +14155550123.",
    );
    check(errors, `transfer_numbers.${index}.e164`, seen.has(transfer.e164), "This number is already in the list.");
    seen.add(transfer.e164);
  });

  check(errors, "faqs", settings.faqs.length > limits.faqs, `Add up to ${limits.faqs} entries.`);
  settings.faqs.forEach((faq, index) => {
    check(errors, `faqs.${index}.question`, !faq.question.trim(), "Write the question.");
    check(
      errors,
      `faqs.${index}.question`,
      faq.question.length > limits.question,
      `Use ${limits.question} characters or fewer.`,
    );
    check(errors, `faqs.${index}.answer`, !faq.answer.trim(), "Write the answer.");
    check(
      errors,
      `faqs.${index}.answer`,
      faq.answer.length > limits.answer,
      `Use ${limits.answer} characters or fewer.`,
    );
  });

  return errors;
}

export type Section = "greeting" | "business" | "languages" | "voice" | "transfers" | "faqs";

/** Which tab of the form a field is on, so the tab can show it has errors. */
export function sectionOf(field: string): Section {
  if (field.startsWith("greeting") || field === "recording_notice") return "greeting";
  if (field === "languages") return "languages";
  if (field === "voice_id") return "voice";
  if (field.startsWith("transfer_numbers")) return "transfers";
  if (field.startsWith("faqs")) return "faqs";
  return "business";
}
