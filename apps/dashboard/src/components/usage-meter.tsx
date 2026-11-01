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

// On the blueprint the bar is drawn in white, since blue on blue doesn't read.
const onInkColor =
  "[&_[data-slot=progress-indicator]]:bg-primary-foreground [&_[data-slot=progress-track]]:bg-primary-foreground/15";

/** The minutes bar on its own: blue (white on the blueprint), amber when the plan is nearly used up, red once over. */
export function UsageBar({ usage, onInk, className }: { usage: Usage; onInk?: boolean; className?: string }) {
  return (
    <Progress
      value={usage.percent}
      aria-label={`${formatNumber(usage.used)} of ${formatNumber(usage.included)} minutes used`}
      className={cn(
        "[&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-track]]:h-1.5",
        onInk && onInkColor,
        barColor[usage.status],
        className,
      )}
    />
  );
}

/** What happens next with the minutes: how many are left, a pace warning, or the overage charge. */
export function usageMessage({ remaining, overMinutes, overCost, projected, included, status }: Usage) {
  if (status === "over")
    return `${formatNumber(overMinutes)} minutes over: ${formatUsd(overCost)} extra at ${formatUsd(overagePerMinute)} a minute.`;
  if (status === "near")
    return `Only ${formatNumber(remaining)} minutes left.${projected > included ? ` At this pace you'll use about ${formatNumber(projected)}.` : ""}`;
  return `${formatNumber(remaining)} minutes left this month.`;
}

/** The bar with its message underneath. */
export function UsageMeter({ usage, className }: { usage: Usage; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <UsageBar usage={usage} />
      <p
        className={cn(
          "text-muted-foreground",
          usage.status === "near" && "text-warning-foreground",
          usage.status === "over" && "text-destructive",
        )}
      >
        {usageMessage(usage)}
      </p>
    </div>
  );
}
