// How the Overview counts calls: the mock uses these now, and they describe what GET /api/overview should return.
import { filterCalls, rangeStart } from "../calls/filter";
import type { Call, DateRange } from "../calls/types";
import type { PeriodCounts, PeriodSummary, VolumeDay } from "./types";

const day = 86_400_000;

function counts(calls: readonly Call[]): PeriodCounts {
  const answered = calls.filter((call) => call.outcome !== "spam");
  return {
    calls_count: answered.length,
    bookings_count: calls.filter((call) => call.outcome === "booking").length,
    transfers_count: calls.filter((call) => call.outcome === "transfer").length,
  };
}

function between(calls: readonly Call[], from: number, to: number) {
  return calls.filter((call) => {
    const time = new Date(call.started_at).getTime();
    return time >= from && time < to;
  });
}

/** The cards' numbers for a range, and the same counts for the period before it, for the trend badges. */
export function summarize(calls: readonly Call[], range: DateRange, now = new Date()): PeriodSummary {
  const current = filterCalls(calls, { q: "", outcome: "", language: "", range, page: 1 }, now);
  const start = rangeStart(range, now)?.getTime();
  const length = start === undefined ? 0 : now.getTime() - start;
  // "Today" is compared with yesterday from midnight to this hour; other ranges with the stretch just before them.
  const previous =
    start === undefined
      ? null
      : range === "today"
        ? between(calls, start - day, now.getTime() - day)
        : between(calls, start - length, start);
  const answered = current.filter((call) => call.outcome !== "spam");

  return {
    range,
    ...counts(current),
    messages_count: current.filter((call) => call.outcome === "message").length,
    spam_blocked_count: current.length - answered.length,
    // The sample business opens 8:00–18:00; the api will use each day's real hours and time zone.
    after_hours_count: answered.filter((call) => {
      const hour = new Date(call.started_at).getHours();
      return hour < 8 || hour >= 18;
    }).length,
    previous: previous && counts(previous),
  };
}

/** Percent change from the previous period, to one decimal. Null when there's nothing to compare with. */
export function trend(current: number, previous: number | undefined): number | null {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

export const chartRanges = [
  { value: "90d", label: "3 months", days: 90 },
  { value: "30d", label: "30 days", days: 30 },
  { value: "7d", label: "7 days", days: 7 },
] as const;

export type ChartRange = (typeof chartRanges)[number]["value"];

/** "2026-10-28" for the local day, so a call at 23:30 counts on the day the owner saw it. */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function fromDayKey(key: string): Date {
  const [year = 0, month = 1, date = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, date);
}

/** Calls answered and booked on each of the last `days` days, oldest first and ending today, with empty days as 0. */
export function dailyVolume(calls: readonly Call[], days: number, now = new Date()): VolumeDay[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const series = Array.from({ length: days }, (_, index) => ({
    date: dayKey(new Date(today.getTime() - (days - 1 - index) * day + day / 2)),
    answered: 0,
    booked: 0,
  }));
  const byDate = new Map(series.map((entry) => [entry.date, entry]));

  for (const call of calls) {
    const entry = byDate.get(dayKey(new Date(call.started_at)));
    if (!entry || call.outcome === "spam") continue;
    entry.answered += 1;
    if (call.outcome === "booking") entry.booked += 1;
  }
  return series;
}

/** The chart's days for a range: the last 7, 30 or 90 entries of a series that ends today. */
export function volumeInRange(series: readonly VolumeDay[], range: ChartRange): VolumeDay[] {
  const days = chartRanges.find((option) => option.value === range)?.days ?? series.length;
  return series.slice(-days);
}
