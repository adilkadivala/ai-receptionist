// Shaped like the `calls` table (apps/server/core/models.py, docs/architecture.md section 6).
// When GET /api/calls exists, replace these with the generated types from @receptionist/api-client.
import type { Language } from "@receptionist/product";

/** How a call ended. The same values as CALL_OUTCOMES in apps/server/core/models.py. */
export type CallOutcome = "answered" | "message" | "booking" | "transfer" | "spam" | "failed" | "abandoned";

export type TranscriptTurn = {
  role: "caller" | "ai";
  text: string;
  language?: Language;
  /** Seconds from the start of the call. */
  at_seconds: number;
};

export type Call = {
  id: string;
  organization_id: string;
  agent_id: string | null;
  phone_number_id: string | null;
  provider_call_id: string | null;
  from_number: string | null;
  to_number: string | null;
  /**
   * The table stores what the voice detected. Here it's a language name from @receptionist/product;
   * the api schema still has to settle on names or codes.
   */
  language: Language | null;
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  outcome: CallOutcome | null;
  transcript: TranscriptTurn[];
  /** What the call cost us across providers (phone line, listening, brain, voice). */
  cost_usd: number | null;
  /** Written by the worker's summarize_call job; null until it runs. Not a column yet. */
  summary: string | null;
  /** The name the caller gave, picked out with the summary. Not a column yet. */
  caller_name: string | null;
};

export type DateRange = "today" | "7d" | "30d" | "90d" | "all";

export type CallFilters = {
  q: string;
  outcome: CallOutcome | "";
  language: Language | "";
  range: DateRange;
  page: number;
};

/** Calls per outcome for the current filters, ignoring the outcome filter, so each tab can show its count. */
export type OutcomeCounts = { all: number } & Partial<Record<CallOutcome, number>>;

export type CallPage = {
  items: Call[];
  total: number;
  page: number;
  page_size: number;
  outcome_counts: OutcomeCounts;
};

/** Today so far: the greeting on the Overview and the badge on Calls in the sidebar. */
export type CallsToday = {
  /** Every call except blocked spam. */
  answered: number;
  /** Messages taken today. Until calls have a read state, these are the ones that may still need a callback. */
  messages: number;
};
