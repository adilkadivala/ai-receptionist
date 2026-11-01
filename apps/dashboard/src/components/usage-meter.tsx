import { formatUsd, overagePerMinute } from "@receptionist/product";
import { Progress } from "@receptionist/ui/components/progress";
import { cn } from "@receptionist/ui/lib/utils";
import { formatNumber } from "../lib/format";
import type { Usage } from "../lib/usage";

const barColor = {
  ok: "",
  near: "[&_[data-slot=progress-indicator]]:bg-warning",
  over: "[&_[data-slot=progress-indicator]]:bg-destructive",
};

/** Minutes used against the plan, with what happens next: minutes left, a pace warning, or the overage charge. */
export function UsageMeter({ usage, className }: { usage: Usage; className?: string }) {
  const { used, included, remaining, percent, overMinutes, overCost, projected, status } = usage;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Progress
        value={percent}
        aria-label={`${formatNumber(used)} of ${formatNumber(included)} minutes used`}
        className={barColor[status]}
      />
      <p className={cn("text-muted-foreground", status === "over" && "text-destructive")}>
        {status === "over" ? (
          <>
            {formatNumber(overMinutes)} minutes over: {formatUsd(overCost)} extra at {formatUsd(overagePerMinute)} a
            minute.
          </>
        ) : status === "near" ? (
          <span className="text-warning">
            Only {formatNumber(remaining)} minutes left.
            {projected > included && ` At this pace you'll use about ${formatNumber(projected)}.`}
          </span>
        ) : (
          <>{formatNumber(remaining)} minutes left this month.</>
        )}
      </p>
    </div>
  );
}
