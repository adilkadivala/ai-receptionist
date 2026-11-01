// The Overview's numbers, counted from `calls` (docs/architecture.md section 6). When GET /api/overview and
// GET /api/overview/volume exist, replace these with their generated types.
import type { DateRange } from "../calls/types";

export type PeriodCounts = {
  /** Every call except blocked spam. */
  calls_count: number;
  bookings_count: number;
  transfers_count: number;
};

export type PeriodSummary = PeriodCounts & {
  range: DateRange;
  messages_count: number;
  spam_blocked_count: number;
  /** Calls that came in outside opening hours. */
  after_hours_count: number;
  /** The same length of time just before, for the trend badges. Null for "all time". */
  previous: PeriodCounts | null;
};

/** One day of the Overview's chart. `date` is the local day, "2026-10-28". */
export type VolumeDay = { date: string; answered: number; booked: number };
