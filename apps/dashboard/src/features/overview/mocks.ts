// MOCK: the Overview's numbers until GET /api/overview exists (build step 6), counted from the sample calls so they
// match the call list.
import { callsBetween, mockSubscription } from "../billing/mocks";
import type { Call } from "../calls/types";
import type { PeriodSummary } from "./types";

const day = 86_400_000;
const start = new Date(mockSubscription.current_period_start);
const end = new Date(mockSubscription.current_period_end);
const current = callsBetween(start, end);
const previous = callsBetween(new Date(start.getTime() - 30 * day), start);
const count = (calls: Call[], outcome: Call["outcome"]) => calls.filter((call) => call.outcome === outcome).length;
const answered = (calls: Call[]) => calls.filter((call) => call.outcome !== "spam");

export const mockPeriodSummary: PeriodSummary = {
  period_start: mockSubscription.current_period_start,
  period_end: mockSubscription.current_period_end,
  calls_count: answered(current).length,
  bookings_count: count(current, "booking"),
  transfers_count: count(current, "transfer"),
  messages_count: count(current, "message"),
  spam_blocked_count: count(current, "spam"),
  // The sample business opens 8:00–18:00; the api will use each day's real hours and time zone.
  after_hours_count: answered(current).filter((call) => {
    const hour = new Date(call.started_at).getHours();
    return hour < 8 || hour >= 18;
  }).length,
  previous: {
    calls_count: answered(previous).length,
    bookings_count: count(previous, "booking"),
    transfers_count: count(previous, "transfer"),
  },
};
