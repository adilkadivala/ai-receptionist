import { formatNumber } from "../../../lib/format";
import { OutcomeBadge } from "../../calls/components/outcome-badge";
import { knownOutcome } from "../format";
import type { AdminOverview } from "../types";

/**
 * Every call so far by how it ended, most first: the outcome's pill, a bar for its share, and the count. The bars are
 * drawn in the one accent; the pills carry the outcome colours.
 */
export function OutcomeBreakdown({ outcomes, total }: { outcomes: AdminOverview["outcomes"]; total: number }) {
  return (
    <ul aria-label="Calls by outcome" className="flex flex-col">
      {outcomes.map(({ outcome, calls }) => {
        const percent = total ? Math.round((calls / total) * 100) : 0;
        return (
          <li
            key={outcome ?? "none"}
            className="grid grid-cols-[minmax(0,8.5rem)_1fr_auto] items-center gap-x-4 border-b border-border/70 px-4 py-3 last:border-b-0 lg:px-5"
          >
            <OutcomeBadge
              outcome={knownOutcome(outcome)}
              emptyLabel={outcome ?? "No outcome yet"}
              className="max-w-full"
            />
            <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${(calls / Math.max(total, 1)) * 100}%` }}
              />
            </div>
            <p className="flex items-baseline justify-end gap-2 tabular-nums">
              <span className="font-medium">{formatNumber(calls)}</span>
              <span className="w-10 text-end text-[13px] text-muted-foreground">{percent}%</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
