// The Overview's numbers for the current billing period, counted from `calls` and `usage_rollups`
// (docs/architecture.md section 6). When GET /api/overview exists, replace this with its generated type.

export type PeriodSummary = {
  period_start: string;
  period_end: string;
  calls_count: number;
  bookings_count: number;
  transfers_count: number;
  messages_count: number;
  spam_blocked_count: number;
  /** Calls that came in outside opening hours. */
  after_hours_count: number;
  previous: {
    calls_count: number;
    bookings_count: number;
    transfers_count: number;
  };
};
