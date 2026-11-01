// Call search and filters: parsed from the URL on the Calls page, and applied by the mock as the api will.
import { allLanguages, type Language } from "@receptionist/product";
import { outcomeIds } from "./outcomes";
import type { Call, CallFilters, CallOutcome, DateRange } from "./types";

export const pageSize = 20;

export const dateRanges: readonly { value: DateRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

export const defaultFilters: CallFilters = { q: "", outcome: "", language: "", range: "all", page: 1 };

function since(range: DateRange, now: Date): number {
  if (range === "all") return Number.NEGATIVE_INFINITY;
  if (range === "today") return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return now.getTime() - (range === "7d" ? 7 : 30) * 24 * 60 * 60_000;
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

export function paginate<T>(items: readonly T[], page: number) {
  const pages = Math.max(Math.ceil(items.length / pageSize), 1);
  const current = Math.min(Math.max(page, 1), pages);
  return {
    items: items.slice((current - 1) * pageSize, current * pageSize),
    total: items.length,
    page: current,
    page_size: pageSize,
  };
}

/** Reads filters from the URL, ignoring values that aren't valid so a bad link still shows calls. */
export function filtersFromParams(params: URLSearchParams): CallFilters {
  const outcome = params.get("outcome") ?? "";
  const language = params.get("language") ?? "";
  const range = params.get("range") ?? "";
  const page = Number.parseInt(params.get("page") ?? "", 10);

  return {
    q: params.get("q") ?? "",
    outcome: outcomeIds.includes(outcome as CallOutcome) ? (outcome as CallOutcome) : "",
    language: allLanguages.includes(language as Language) ? (language as Language) : "",
    range: dateRanges.some((option) => option.value === range) ? (range as DateRange) : defaultFilters.range,
    page: page > 0 ? page : 1,
  };
}

/** The inverse of filtersFromParams. Defaults are left out to keep links short. */
export function filtersToParams(filters: CallFilters): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ["q", "outcome", "language", "range", "page"] as const) {
    if (filters[key] !== defaultFilters[key]) params.set(key, String(filters[key]));
  }
  return params;
}

export function hasFilters(filters: CallFilters): boolean {
  return Boolean(filters.q || filters.outcome || filters.language || filters.range !== defaultFilters.range);
}
