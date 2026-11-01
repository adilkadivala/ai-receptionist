// Shaped like the `agents` table and the planned versioned `agent_configs` (docs/architecture.md section 6).
// When the agent routes exist, replace these with the generated types from @receptionist/api-client.
import type { Language } from "@receptionist/product";

/** One receptionist setup. Its settings live in versioned configs, so a bad edit can be rolled back. */
export type Agent = {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export const weekdays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Weekday = (typeof weekdays)[number];

/** "09:00" to "17:00" in the business's time zone. */
export type DayHours = { open: boolean; from: string; to: string };

export type TransferNumber = {
  id: string;
  /** Who picks up, e.g. "On-call plumber". */
  label: string;
  e164: string;
  /** When the receptionist should transfer, in the owner's words. */
  when: string;
};

export type FaqEntry = { id: string; question: string; answer: string };

/** Everything the owner can change about what the receptionist says, knows and does. */
export type AgentSettings = {
  greeting: string;
  /** Adds "this call may be recorded" to the AI notice. Off in HIPAA mode, where calls aren't recorded. */
  recording_notice: boolean;
  business_name: string;
  business_info: string;
  address: string;
  time_zone: string;
  hours: Record<Weekday, DayHours>;
  /** Languages the business expects; the voice still follows whatever the caller speaks. */
  languages: Language[];
  voice_id: string;
  transfer_numbers: TransferNumber[];
  faqs: FaqEntry[];
};

/** One saved version of an agent's settings. */
export type AgentConfig = AgentSettings & {
  id: string;
  agent_id: string;
  version: number;
  created_at: string;
};

export type Voice = {
  id: string;
  name: string;
  description: string;
};
