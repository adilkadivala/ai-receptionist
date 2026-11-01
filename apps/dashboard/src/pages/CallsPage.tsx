import { DateRangePicker } from "../components/date-range-picker";
import { HeaderActions } from "../components/header-slot";
import { CallLog } from "../features/calls/components/call-log";
import { CallSheet } from "../features/calls/components/call-sheet";
import { defaultFilters, pageSize } from "../features/calls/filter";
import { useCallFilters } from "../features/calls/use-call-filters";

export function CallsPage() {
  const [filters, update] = useCallFilters(defaultFilters);

  return (
    <>
      <HeaderActions>
        <DateRangePicker value={filters.range} onValueChange={(range) => update({ range })} />
      </HeaderActions>
      <CallLog
        label="Every call"
        filters={filters}
        defaults={defaultFilters}
        onChange={update}
        pageSize={pageSize}
        searchable
      />
      <CallSheet />
    </>
  );
}
