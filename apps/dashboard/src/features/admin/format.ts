import { findPlan } from "@receptionist/product";
import { outcomes } from "../calls/outcomes";
import type { CallOutcome } from "../calls/types";
import type { CallSummary } from "./types";

const languageNames = new Intl.DisplayNames(undefined, { type: "language", fallback: "code" });

/** Talk time in whole minutes: "0", "<1" for under a minute, then "1,234". */
export function formatMinutes(seconds: number): string {
  if (seconds === 0) return "0";
  if (seconds < 60) return "<1";
  return Math.round(seconds / 60).toLocaleString();
}

/** "en" → "English". Calls store the code the listening service detected. */
export function languageName(code: string | null): string {
  if (!code) return "—";
  try {
    return languageNames.of(code) ?? code;
  } catch {
    return code;
  }
}

/** "pro" → "Pro". Enterprise isn't a self-serve plan, so it has no entry in @receptionist/product. */
export function planName(plan: string): string {
  return findPlan(plan)?.name ?? plan.charAt(0).toUpperCase() + plan.slice(1);
}

const regions: Record<string, string> = { us: "US", eu: "EU", in: "India" };

export function regionName(region: string): string {
  return regions[region] ?? region.toUpperCase();
}

/** The outcome as the call table knows it, or null for one the dashboard doesn't know yet (shown as "No outcome"). */
export function knownOutcome(outcome: string | null): CallOutcome | null {
  return outcome && outcome in outcomes ? (outcome as CallOutcome) : null;
}

const text = (value: unknown) => (typeof value === "string" && value.trim() ? value.trim() : undefined);

/** The summary's fields that are there and are text, or null when there's no summary. Claude says "Not given" for gaps. */
export function readSummary(summary: Record<string, unknown> | null | undefined): CallSummary | null {
  if (!summary) return null;
  const given = (value: unknown) => {
    const found = text(value);
    return found && found.toLowerCase() !== "not given" ? found : undefined;
  };
  const steps = Array.isArray(summary.next_steps)
    ? summary.next_steps.map(text).filter((step) => step !== undefined)
    : [];
  return {
    headline: text(summary.headline),
    caller_name: given(summary.caller_name),
    phone_number: given(summary.phone_number),
    need: text(summary.need),
    urgency: text(summary.urgency),
    outcome: text(summary.outcome),
    next_steps: steps,
  };
}
