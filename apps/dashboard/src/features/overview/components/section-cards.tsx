import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { QueryError } from "../../../components/query-error";
import { StatCard, TrendBadge } from "../../../components/stat-card";
import { resting } from "../../../components/surfaces";
import { UsageBar, usageMessage } from "../../../components/usage-meter";
import { formatNumber, formatShortDate } from "../../../lib/format";
import { usePlanUsage } from "../../billing/api";
import { dateRanges } from "../../calls/filter";
import type { DateRange } from "../../calls/types";
import { usePeriodSummary } from "../api";
import { trend } from "../summary";

/** "the previous 30 days", for the trend badges' screen-reader text. */
function previousLabel(range: DateRange) {
  if (range === "today") return "yesterday at this time";
  const label = dateRanges.find((option) => option.value === range)?.label ?? "";
  return label.replace(/^Last/, "the previous");
}

/**
 * The four numbers an owner checks first, as a band of cells split by hairlines that runs edge to edge across the
 * sheet, like the landing page's product grid. Calls follow the header's date range; minutes are the billing month.
 */
export function SectionCards({ range }: { range: DateRange }) {
  const summary = usePeriodSummary(range);
  const { usage, rollup, plan, isPending: usagePending } = usePlanUsage();
  const data = summary.data;
  const against = previousLabel(range);

  if (summary.isError) return <QueryError title="Couldn't load these numbers" onRetry={() => summary.refetch()} />;

  const oneIn = data && data.bookings_count > 0 ? Math.round(data.calls_count / data.bookings_count) : null;

  return (
    <section
      aria-label={dateRanges.find((option) => option.value === range)?.label}
      aria-busy={summary.isPlaceholderData}
      className="-mx-4 grid grid-cols-2 gap-px border-b bg-border transition-opacity aria-busy:opacity-60 *:bg-background lg:-mx-6 @3xl/main:grid-cols-4"
    >
      <StatCard
        label="Calls answered"
        loading={!data}
        value={data && formatNumber(data.calls_count)}
        badge={data && <TrendBadge change={trend(data.calls_count, data.previous?.calls_count)} against={against} />}
        hint={
          data &&
          (data.after_hours_count > 0
            ? `${formatNumber(data.after_hours_count)} after hours, ${formatNumber(data.spam_blocked_count)} spam blocked`
            : `${formatNumber(data.spam_blocked_count)} spam calls blocked`)
        }
      />
      <StatCard
        label="Minutes used"
        loading={usagePending}
        value={
          usage && (
            <>
              {formatNumber(usage.used)}
              <span className="text-lg tracking-[-0.01em] text-muted-foreground">
                {" "}
                / {formatNumber(usage.included)}
              </span>
            </>
          )
        }
        badge={
          usage && (
            <Badge variant="outline" className={cn("h-[22px] px-2 font-mono font-normal text-foreground/80", resting)}>
              {usage.percent}%
            </Badge>
          )
        }
        hint={
          usage &&
          rollup &&
          (usage.status === "ok" ? (
            `${plan ? `${plan.name} plan · ` : ""}resets ${formatShortDate(rollup.period_end)}`
          ) : (
            <span className={usage.status === "over" ? "text-destructive" : "text-warning-foreground"}>
              {usageMessage(usage)}
            </span>
          ))
        }
      >
        {usage && <UsageBar usage={usage} />}
      </StatCard>
      <StatCard
        label="Bookings made"
        loading={!data}
        value={data && formatNumber(data.bookings_count)}
        badge={
          data && <TrendBadge change={trend(data.bookings_count, data.previous?.bookings_count)} against={against} />
        }
        hint={oneIn ? `1 in ${oneIn} calls became a booking` : "No bookings in this range"}
      />
      <StatCard
        label="Sent to you"
        loading={!data}
        value={data && formatNumber(data.transfers_count)}
        badge={
          data && <TrendBadge change={trend(data.transfers_count, data.previous?.transfers_count)} against={against} />
        }
        hint="Calls put through to your team"
      />
    </section>
  );
}
