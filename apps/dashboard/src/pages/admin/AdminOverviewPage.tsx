import { HatchBand } from "@receptionist/ui/blocks/drafting";
import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowRight, PhoneIncoming } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { QueryError } from "../../components/query-error";
import { SectionTitle } from "../../components/section-title";
import { StatCard } from "../../components/stat-card";
import { floating, resting } from "../../components/surfaces";
import { useAdminOverview, viewerTimeZone } from "../../features/admin/api";
import { OutcomeBreakdown } from "../../features/admin/components/outcome-breakdown";
import { formatMinutes } from "../../features/admin/format";
import { formatLongDate, formatNumber } from "../../lib/format";

/** Totals across every customer, straight from the database. */
export function AdminOverviewPage() {
  const timeZone = viewerTimeZone();
  const overview = useAdminOverview(timeZone);
  const data = overview.data;
  const withoutOutcome = data?.outcomes.find((row) => row.outcome === null)?.calls ?? 0;

  return (
    <>
      <PageHeader
        eyebrow={formatLongDate(new Date())}
        title="Every customer, in one place"
        actions={
          <Link to="/admin/customers" className={cn(buttonVariants({ variant: "outline" }), resting)}>
            See every customer
            <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
          </Link>
        }
      >
        Live from the database. Today starts at midnight in {timeZone}, and the week on Monday.
      </PageHeader>
      {overview.isError ? (
        <QueryError title="Couldn't load the totals" onRetry={() => overview.refetch()}>
          Check that the api is running on this computer. It refuses admin requests from anywhere else.
        </QueryError>
      ) : (
        <>
          <HatchBand className="-mx-4 h-6 lg:-mx-6" />
          <section
            aria-label="Totals across every customer"
            className="-mx-4 grid grid-cols-2 gap-px border-b bg-border *:bg-background lg:-mx-6 @3xl/main:grid-cols-3 @6xl/main:grid-cols-6"
          >
            <StatCard
              label="Customers"
              loading={!data}
              value={data && formatNumber(data.customers)}
              hint="Organizations signed up"
            />
            <StatCard
              label="Calls today"
              loading={!data}
              value={data && formatNumber(data.calls_today)}
              hint="Since midnight"
            />
            <StatCard
              label="Calls this week"
              loading={!data}
              value={data && formatNumber(data.calls_this_week)}
              hint="Since Monday"
            />
            <StatCard
              label="All calls"
              loading={!data}
              value={data && formatNumber(data.calls)}
              hint={
                withoutOutcome > 0 ? `${formatNumber(withoutOutcome)} without an outcome yet` : "Since the first call"
              }
            />
            <StatCard
              label="Minutes this week"
              loading={!data}
              value={data && formatMinutes(data.call_seconds_this_week)}
              hint="Talk time since Monday"
            />
            <StatCard
              label="All minutes"
              loading={!data}
              value={data && formatMinutes(data.call_seconds)}
              hint="Talk time, every call"
            />
          </section>
          <section aria-labelledby="calls-by-outcome" className="mt-8 flex flex-col gap-4">
            <SectionTitle
              id="calls-by-outcome"
              title="Calls by outcome"
              description="Every call so far, by how it ended."
            />
            {data && data.calls === 0 ? (
              <EmptyState icon={PhoneIncoming} title="No calls yet">
                Calls show up here once the voice process saves them at the end of each call.
              </EmptyState>
            ) : (
              <div className={cn(floating, "overflow-hidden")}>
                {data ? (
                  <OutcomeBreakdown outcomes={data.outcomes} total={data.calls} />
                ) : (
                  <div aria-busy="true" className="h-40" />
                )}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
