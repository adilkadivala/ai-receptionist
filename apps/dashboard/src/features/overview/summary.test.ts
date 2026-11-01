import { describe, expect, test } from "vitest";
import type { Call, CallOutcome } from "../calls/types";
import { chartRanges, dailyVolume, dayKey, summarize, trend, volumeInRange } from "./summary";

const now = new Date("2026-11-10T15:00:00");

function call(id: string, outcome: CallOutcome, startedAt: string): Call {
  return {
    id,
    organization_id: "org",
    agent_id: null,
    phone_number_id: null,
    provider_call_id: null,
    from_number: "+14155550100",
    to_number: "+14155550142",
    language: "English",
    started_at: new Date(startedAt).toISOString(),
    ended_at: null,
    duration_seconds: 60,
    outcome,
    transcript: [],
    cost_usd: null,
    summary: null,
    caller_name: null,
  };
}

const calls = [
  call("today-booking", "booking", "2026-11-10T09:00:00"),
  call("today-evening-transfer", "transfer", "2026-11-10T07:30:00"),
  call("today-spam", "spam", "2026-11-10T11:00:00"),
  // Yesterday: one before 15:00 (compared with today), one after (not yet "at this time" today).
  call("yesterday-booking", "booking", "2026-11-09T10:00:00"),
  call("yesterday-late", "answered", "2026-11-09T20:00:00"),
  call("week-ago-message", "message", "2026-11-05T12:00:00"),
  call("old-booking", "booking", "2026-10-01T12:00:00"),
];

describe("summarize", () => {
  test("counts a range, leaving spam out of calls answered", () => {
    expect(summarize(calls, "today", now)).toMatchObject({
      calls_count: 2,
      bookings_count: 1,
      transfers_count: 1,
      spam_blocked_count: 1,
      // 7:30 is before the sample business opens at 8.
      after_hours_count: 1,
    });
  });

  test("compares today with yesterday up to the same hour", () => {
    expect(summarize(calls, "today", now).previous).toEqual({
      calls_count: 1,
      bookings_count: 1,
      transfers_count: 0,
    });
  });

  test("compares 7 days with the 7 days before", () => {
    const week = summarize(calls, "7d", now);
    expect(week).toMatchObject({ calls_count: 5, messages_count: 1 });
    expect(week.previous).toEqual({ calls_count: 0, bookings_count: 0, transfers_count: 0 });
  });

  test("has nothing to compare all time with", () => {
    expect(summarize(calls, "all", now)).toMatchObject({ calls_count: 6, bookings_count: 3, previous: null });
  });
});

test("trend is the percent change, or null without a baseline", () => {
  expect(trend(112, 100)).toBe(12);
  expect(trend(2, 3)).toBe(-33.3);
  expect(trend(5, 0)).toBeNull();
  expect(trend(5, undefined)).toBeNull();
});

describe("dailyVolume", () => {
  test("one entry per day, oldest first, ending today, with quiet days at zero", () => {
    const series = dailyVolume(calls, 7, now);
    expect(series.map((day) => day.date)).toEqual([
      "2026-11-04",
      "2026-11-05",
      "2026-11-06",
      "2026-11-07",
      "2026-11-08",
      "2026-11-09",
      "2026-11-10",
    ]);
    expect(series.at(-1)).toEqual({ date: "2026-11-10", answered: 2, booked: 1 });
    expect(series.at(-2)).toEqual({ date: "2026-11-09", answered: 2, booked: 1 });
    expect(series[0]).toEqual({ date: "2026-11-04", answered: 0, booked: 0 });
  });

  test("leaves out calls older than the series", () => {
    const total = dailyVolume(calls, 30, now).reduce((sum, day) => sum + day.answered, 0);
    expect(total).toBe(5);
  });

  test("counts a late-evening call on its local day", () => {
    expect(dayKey(new Date("2026-11-09T23:59:00"))).toBe("2026-11-09");
  });
});

describe("volumeInRange", () => {
  const series = dailyVolume(calls, 90, now);

  test.each(chartRanges)("$label shows the last $days days, up to today", ({ value, days }) => {
    const shown = volumeInRange(series, value);
    expect(shown).toHaveLength(days);
    expect(shown.at(-1)?.date).toBe("2026-11-10");
  });

  test("shows everything when the series is shorter than the range", () => {
    expect(volumeInRange(dailyVolume(calls, 5, now), "30d")).toHaveLength(5);
  });
});
