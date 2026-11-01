// Call search and filters: parsed from the URL on the Calls page, and applied by the mock as the api will.
import { allLanguages, type Language } from "@receptionist/product";
import { outcomeIds } from "./outcomes";
import type { Call, CallFilters, CallOutcome, DateRange, OutcomeCounts } from "./types";

export const pageSize = 20;

export const dateRanges: readonly { value: DateRange; label: string; short: string; days?: number }[] = [
  { value: "today", label: "Today", short: "Today" },
  { value: "7d", label: "Last 7 days", short: "7 days", days: 7 },
  { value: "30d", label: "Last 30 days", short: "30 days", days: 30 },
  { value: "90d", label: "Last 3 months", short: "3 months", days: 90 },
  { value: "all", label: "All time", short: "All time" },
];

export const defaultFilters: CallFilters = { q: "", outcome: "", language: "", range: "all", page: 1 };

/** When a range starts, or null for "all". `days` ranges count back from now; "today" starts at local midnight. */
export function rangeStart(range: DateRange, now = new Date()): Date | null {
  if (range === "all") return null;
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days = dateRanges.find((option) => option.value === range)?.days ?? 0;
  return new Date(now.getTime() - days * 24 * 60 * 60_000);
}

function since(range: DateRange, now: Date): number {
  return rangeStart(range, now)?.getTime() ?? Number.NEGATIVE_INFINITY;
}

/**
 * Matches the caller's number (ignoring spaces, dashes and brackets), their name, or the summary.
 * Every filter must match. Newest first.
 */
export function filterCalls(calls: readonly Call[], filters: CallFilters, now = new Date()): Call[] {
  const text = filters.q.trim().toLowerCase();
  const digits = text.replace(/\D/g, "");
  const from = since(filters.range, now);

  return calls
    .filter((call) => {
      if (filters.outcome && call.outcome !== filters.outcome) return false;
      if (filters.language && call.language !== filters.language) return false;
      if (new Date(call.started_at).getTime() < from) return false;
      if (!text) return true;
      return (
        (digits.length >= 3 && (call.from_number ?? "").includes(digits)) ||
        (call.caller_name ?? "").toLowerCase().includes(text) ||
        (call.summary ?? "").toLowerCase().includes(text)
      );
    })
    .sort((a, b) => b.started_at.localeCompare(a.started_at));
}

export function paginate<T>(items: readonly T[], page: number, size = pageSize) {
  const pages = Math.max(Math.ceil(items.length / size), 1);
  const current = Math.min(Math.max(page, 1), pages);
  return {
    items: items.slice((current - 1) * size, current * size),
    total: items.length,
    page: current,
    page_size: size,
  };
}

/** How many calls each outcome tab would show: every filter applies except the outcome itself. */
export function countOutcomes(calls: readonly Call[], filters: CallFilters, now = new Date()): OutcomeCounts {
  const counts: OutcomeCounts = { all: 0 };
  for (const call of filterCalls(calls, { ...filters, outcome: "" }, now)) {
    counts.all += 1;
    if (call.outcome) counts[call.outcome] = (counts[call.outcome] ?? 0) + 1;
  }
  return counts;
}

/**
 * Reads filters from the URL, ignoring values that aren't valid so a bad link still shows calls. Pages that open on
 * another range than "all" (the Overview opens on 30 days) pass their own defaults.
 */
export function filtersFromParams(params: URLSearchParams, defaults = defaultFilters): CallFilters {
  const outcome = params.get("outcome") ?? "";
  const language = params.get("language") ?? "";
  const range = params.get("range") ?? "";
  const page = Number.parseInt(params.get("page") ?? "", 10);

  return {
    q: params.get("q") ?? "",
    outcome: outcomeIds.includes(outcome as CallOutcome) ? (outcome as CallOutcome) : "",
    language: allLanguages.includes(language as Language) ? (language as Language) : "",
    range: dateRanges.some((option) => option.value === range) ? (range as DateRange) : defaults.range,
    page: page > 0 ? page : 1,
  };
}

/** The inverse of filtersFromParams. Defaults are left out to keep links short. */
export function filtersToParams(filters: CallFilters, defaults = defaultFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ["q", "outcome", "language", "range", "page"] as const) {
    if (filters[key] !== defaults[key]) params.set(key, String(filters[key]));
  }
  return params;
}

export function hasFilters(filters: CallFilters, defaults = defaultFilters): boolean {
  return Boolean(filters.q || filters.outcome || filters.language || filters.range !== defaults.range);
}
