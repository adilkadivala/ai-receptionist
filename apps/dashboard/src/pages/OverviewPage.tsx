import { PageHeader } from "../components/page-header";
import { PeriodStats } from "../features/overview/components/period-stats";
import { RecentCalls } from "../features/overview/components/recent-calls";
import { ServerStatusCard } from "../features/overview/components/server-status-card";

export function OverviewPage() {
  return (
    <>
      <PageHeader title="Overview">Calls answered, minutes used and anything that needs your attention.</PageHeader>
      <div className="flex flex-col gap-6">
        <PeriodStats />
        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <RecentCalls />
          </div>
          <ServerStatusCard />
        </div>
      </div>
    </>
  );
}
