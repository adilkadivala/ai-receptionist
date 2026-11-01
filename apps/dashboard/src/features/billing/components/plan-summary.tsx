import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import { buttonVariants } from "@receptionist/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { QueryError } from "../../../components/query-error";
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
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
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
            <a href="#change-plan" className={buttonVariants({ variant: "outline", size: "sm" })}>
              Change plan
            </a>
          </div>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Minutes this period</CardTitle>
          <CardDescription>
            {formatDate(rollup.period_start)} to {formatDate(rollup.period_end)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4">
          <p>
            <span className="font-heading text-4xl font-semibold tabular-nums">{formatNumber(usage.used)}</span>
            <span className="text-muted-foreground"> of {formatNumber(usage.included)} minutes</span>
          </p>
          <UsageMeter usage={usage} />
          <p className="mt-auto text-muted-foreground">
            {formatNumber(rollup.calls_count)} calls so far. Blocked spam calls don't use minutes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
