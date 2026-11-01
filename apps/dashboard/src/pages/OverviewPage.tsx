import { HatchBand } from "@receptionist/ui/blocks/drafting";
import { DateRangePicker } from "../components/date-range-picker";
import { HeaderActions } from "../components/header-slot";
import { CallLog } from "../features/calls/components/call-log";
import { defaultFilters } from "../features/calls/filter";
import type { CallFilters } from "../features/calls/types";
import { useCallFilters } from "../features/calls/use-call-filters";
import { CallsChart } from "../features/overview/components/calls-chart";
import { Greeting } from "../features/overview/components/greeting";
import { SectionCards } from "../features/overview/components/section-cards";
import { ServerStatusCard } from "../features/overview/components/server-status-card";

// The Overview opens on the last 30 days; the header's date range changes the cards and the table together.
const overviewDefaults: CallFilters = { ...defaultFilters, range: "30d" };

export function OverviewPage() {
  const [filters, update] = useCallFilters(overviewDefaults);

  return (
    <>
      <HeaderActions>
        <DateRangePicker value={filters.range} onValueChange={(range) => update({ range })} />
      </HeaderActions>
      <Greeting />
      {/* As on the landing page, a hatched band leads into the band of numbers. */}
      <HatchBand className="-mx-4 h-6 lg:-mx-6" />
      <SectionCards range={filters.range} />
      <div className="mt-6 flex flex-col gap-6">
        <CallsChart />
        <CallLog label="Recent calls" filters={filters} defaults={overviewDefaults} onChange={update} pageSize={8} />
        <ServerStatusCard />
      </div>
    </>
  );
}
