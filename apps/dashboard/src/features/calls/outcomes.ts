import type { CallOutcome } from "./types";

// The Signal design's outcome colours (docs/design/README.md). Status colours appear only on call outcomes.
export type OutcomeTone = "success" | "brand" | "warning" | "neutral" | "muted" | "destructive";

export const outcomes: Record<CallOutcome, { label: string; tab?: string; tone: OutcomeTone }> = {
  booking: { label: "Booked", tab: "Booked", tone: "success" },
  transfer: { label: "Transferred", tab: "Transferred", tone: "brand" },
  message: { label: "Message taken", tab: "Messages", tone: "warning" },
  answered: { label: "Answered", tone: "neutral" },
  spam: { label: "Spam blocked", tab: "Spam", tone: "muted" },
  abandoned: { label: "Hung up", tone: "muted" },
  failed: { label: "Failed", tone: "destructive" },
};

export const outcomeIds = Object.keys(outcomes) as CallOutcome[];

/** The outcomes with a tab of their own above the call table. The rest show under "All calls". */
export const tabbedOutcomes = outcomeIds.filter((id) => outcomes[id].tab);
