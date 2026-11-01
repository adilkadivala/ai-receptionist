import { describe, expect, test } from "vitest";
import {
  defaultFilters,
  filterCalls,
  filtersFromParams,
  filtersToParams,
  hasFilters,
  pageSize,
  paginate,
} from "./filter";
import type { Call, CallFilters } from "./types";

const now = new Date("2026-11-10T15:00:00");

function call(overrides: Partial<Call>): Call {
  return {
    id: "call",
    organization_id: "org",
    agent_id: null,
    phone_number_id: null,
    provider_call_id: null,
    from_number: "+14155550100",
    to_number: "+14155550142",
    language: "English",
    started_at: new Date("2026-11-10T09:00:00").toISOString(),
    ended_at: null,
    duration_seconds: 60,
    outcome: "answered",
    transcript: [],
    cost_usd: null,
    summary: null,
    caller_name: null,
    ...overrides,
  };
}

const calls = [
  call({ id: "booking-today", outcome: "booking", caller_name: "Grace Kim", summary: "Booked a water heater repair." }),
  call({
    id: "spanish-3-days",
    language: "Spanish",
    outcome: "booking",
    from_number: "+16505550122",
    started_at: new Date("2026-11-07T10:00:00").toISOString(),
    summary: "Leaking kitchen faucet.",
  }),
  call({ id: "transfer-20-days", outcome: "transfer", started_at: new Date("2026-10-21T10:00:00").toISOString() }),
  call({
    id: "spam-45-days",
    outcome: "spam",
    language: null,
    started_at: new Date("2026-09-26T10:00:00").toISOString(),
  }),
];

const filters = (overrides: Partial<CallFilters>): CallFilters => ({ ...defaultFilters, ...overrides });
const ids = (result: Call[]) => result.map((c) => c.id);

describe("filterCalls", () => {
  test("returns every call, newest first, with no filters", () => {
    const shuffled = [calls[2], calls[0], calls[3], calls[1]] as Call[];
    expect(ids(filterCalls(shuffled, defaultFilters, now))).toEqual([
      "booking-today",
      "spanish-3-days",
      "transfer-20-days",
      "spam-45-days",
    ]);
  });

  test("filters by outcome and language", () => {
    expect(ids(filterCalls(calls, filters({ outcome: "booking" }), now))).toEqual(["booking-today", "spanish-3-days"]);
    expect(ids(filterCalls(calls, filters({ outcome: "booking", language: "Spanish" }), now))).toEqual([
      "spanish-3-days",
    ]);
  });

  test("filters by date range", () => {
    expect(ids(filterCalls(calls, filters({ range: "today" }), now))).toEqual(["booking-today"]);
    expect(ids(filterCalls(calls, filters({ range: "7d" }), now))).toEqual(["booking-today", "spanish-3-days"]);
    expect(ids(filterCalls(calls, filters({ range: "30d" }), now))).toHaveLength(3);
  });

  test("searches the caller's number however it's typed", () => {
    expect(ids(filterCalls(calls, filters({ q: "(650) 555-0122" }), now))).toEqual(["spanish-3-days"]);
    expect(ids(filterCalls(calls, filters({ q: "650 555" }), now))).toEqual(["spanish-3-days"]);
  });

  test("searches names and summaries without caring about case", () => {
    expect(ids(filterCalls(calls, filters({ q: "grace" }), now))).toEqual(["booking-today"]);
    expect(ids(filterCalls(calls, filters({ q: "FAUCET" }), now))).toEqual(["spanish-3-days"]);
    expect(filterCalls(calls, filters({ q: "boiler" }), now)).toEqual([]);
  });

  test("doesn't match numbers on one or two digits", () => {
    // "5" is in every number; matching it would make search useless.
    expect(filterCalls(calls, filters({ q: "5" }), now)).toEqual([]);
  });
});

describe("filters in the URL", () => {
  test("round-trip, leaving defaults out", () => {
    const chosen = filters({ q: "faucet", outcome: "booking", language: "Spanish", range: "7d", page: 2 });
    const params = filtersToParams(chosen);
    expect(params.toString()).toBe("q=faucet&outcome=booking&language=Spanish&range=7d&page=2");
    expect(filtersFromParams(params)).toEqual(chosen);
    expect(filtersToParams(defaultFilters).toString()).toBe("");
  });

  test("ignore values that aren't valid", () => {
    const params = new URLSearchParams("outcome=exploded&language=Klingon&range=1y&page=-3");
    expect(filtersFromParams(params)).toEqual(defaultFilters);
  });

  test("hasFilters ignores the page", () => {
    expect(hasFilters(filters({ page: 3 }))).toBe(false);
    expect(hasFilters(filters({ range: "today" }))).toBe(true);
  });
});

test("paginate clamps the page into range", () => {
  const items = Array.from({ length: pageSize * 2 + 5 }, (_, index) => index);
  expect(paginate(items, 3)).toMatchObject({ page: 3, total: pageSize * 2 + 5 });
  expect(paginate(items, 3).items).toHaveLength(5);
  expect(paginate(items, 99).page).toBe(3);
  expect(paginate([], 1)).toMatchObject({ items: [], page: 1, total: 0 });
});
