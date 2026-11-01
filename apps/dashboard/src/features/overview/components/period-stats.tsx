import { CalendarCheck, Clock, PhoneForwarded, PhoneIncoming } from "lucide-react";
import { Link } from "react-router";
import { QueryError } from "../../../components/query-error";
import { StatCard } from "../../../components/stat-card";
import { UsageMeter } from "../../../components/usage-meter";
import { formatDate, formatNumber } from "../../../lib/format";
import { usePlanUsage } from "../../billing/api";
import { usePeriodSummary } from "../api";

function StatLink({ to, children }: { to: string; children: string }) {
  return (
    <Link to={to} className="mt-auto w-fit text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

function percent(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

/** The four numbers an owner checks first, for the current billing month. */
export function PeriodStats() {
  const summary = usePeriodSummary();
  const { plan, usage, isPending: usagePending } = usePlanUsage();
  const data = summary.data;

  if (summary.isError)
    return <QueryError title="Couldn't load this month's numbers" onRetry={() => summary.refetch()} />;

  return (
    <section aria-labelledby="period-title" className="flex flex-col gap-3">
      <h2 id="period-title" className="text-sm text-muted-foreground">
        {data ? `This billing month: ${formatDate(data.period_start)} to ${formatDate(data.period_end)}` : " "}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Calls this month"
          icon={PhoneIncoming}
          loading={!data}
          value={data && formatNumber(data.calls_count)}
          hint={
            data &&
            `${formatNumber(data.after_hours_count)} outside opening hours. ${formatNumber(data.spam_blocked_count)} spam calls blocked.`
          }
        >
          <StatLink to="/calls">See all calls</StatLink>
        </StatCard>
        <StatCard
          label="Minutes used"
          icon={Clock}
          loading={usagePending}
          value={usage && formatNumber(usage.used)}
          hint={usage && plan && `of ${formatNumber(usage.included)} on the ${plan.name} plan`}
        >
          {usage && <UsageMeter usage={usage} />}
        </StatCard>
        <StatCard
          label="Bookings made"
          icon={CalendarCheck}
          loading={!data}
          value={data && formatNumber(data.bookings_count)}
          hint={
            data &&
            `${percent(data.bookings_count, data.calls_count)}% of calls. Last month: ${data.previous.bookings_count}.`
          }
        >
          <StatLink to="/calls?outcome=booking">See bookings</StatLink>
        </StatCard>
        <StatCard
          label="Calls transferred"
          icon={PhoneForwarded}
          loading={!data}
          value={data && formatNumber(data.transfers_count)}
          hint={data && `Put through to your team. Last month: ${data.previous.transfers_count}.`}
        >
          <StatLink to="/calls?outcome=transfer">See transfers</StatLink>
        </StatCard>
      </div>
    </section>
  );
}
