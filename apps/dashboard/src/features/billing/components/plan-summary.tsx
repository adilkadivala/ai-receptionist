import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import { Badge } from "@receptionist/ui/components/badge";
import { buttonVariants } from "@receptionist/ui/components/button";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { QueryError } from "../../../components/query-error";
import { StatCard } from "../../../components/stat-card";
import { floating, resting } from "../../../components/surfaces";
import { UsageMeter } from "../../../components/usage-meter";
import { formatDate, formatNumber } from "../../../lib/format";
import { usePlanUsage } from "../api";

/** The current plan next to the minutes used this period. */
export function PlanSummary() {
  const { plan, subscription, rollup, usage, isPending, isError } = usePlanUsage();

  if (isError) return <QueryError title="Couldn't load your plan" />;
  if (isPending || !plan || !subscription || !rollup || !usage) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-56 rounded-[16px]" />
        <Skeleton className="h-56 rounded-[16px]" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PlanCard
        plan={plan}
        badge="Your plan"
        highlighted
        action={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <span className="text-muted-foreground">Renews {formatDate(subscription.current_period_end)}</span>
            <a href="#change-plan" className={cn(buttonVariants({ variant: "outline", size: "sm" }), resting)}>
              Change plan
            </a>
          </div>
        }
      />
      <StatCard
        className={cn(floating, "p-7 lg:px-7")}
        label={`Minutes, ${formatDate(rollup.period_start)} to ${formatDate(rollup.period_end)}`}
        value={
          <>
            {formatNumber(usage.used)}
            <span className="text-lg tracking-[-0.01em] text-muted-foreground"> / {formatNumber(usage.included)}</span>
          </>
        }
        badge={
          <Badge variant="outline" className={cn("h-[22px] px-2 font-mono font-normal text-foreground/80", resting)}>
            {usage.percent}%
          </Badge>
        }
        hint={`${formatNumber(rollup.calls_count)} calls so far. Blocked spam calls don't use minutes.`}
      >
        <UsageMeter usage={usage} />
      </StatCard>
    </div>
  );
}
