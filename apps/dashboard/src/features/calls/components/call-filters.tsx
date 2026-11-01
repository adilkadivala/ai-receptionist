import { allLanguages } from "@receptionist/product";
import { useEffect, useState } from "react";
import { FilterSelect, TableToolbar } from "../../../components/table-toolbar";
import { dateRanges, defaultFilters, hasFilters } from "../filter";
import { outcomeIds, outcomes } from "../outcomes";
import type { CallFilters } from "../types";

const outcomeOptions = outcomeIds.map((id) => ({ value: id, label: outcomes[id].label }));
const languageOptions = allLanguages.map((language) => ({ value: language, label: language }));

/** Search and filters for the call list. Search waits for a pause in typing before it asks for results. */
export function CallFiltersBar({
  filters,
  onChange,
}: {
  filters: CallFilters;
  onChange: (patch: Partial<CallFilters>) => void;
}) {
  const [search, setSearch] = useState(filters.q);

  // Follow the URL when it changes from outside, e.g. the back button or "Clear filters".
  useEffect(() => setSearch(filters.q), [filters.q]);

  useEffect(() => {
    if (search === filters.q) return;
    const timer = setTimeout(() => onChange({ q: search }), 250);
    return () => clearTimeout(timer);
  }, [search, filters.q, onChange]);

  return (
    <TableToolbar
      search={search}
      onSearchChange={setSearch}
      searchLabel="Search by number, name or summary"
      searchPlaceholder="Search calls"
      canReset={hasFilters(filters)}
      onReset={() => onChange(defaultFilters)}
    >
      <FilterSelect
        label="Outcome"
        allLabel="All outcomes"
        value={filters.outcome}
        options={outcomeOptions}
        onValueChange={(outcome) => onChange({ outcome: outcome as CallFilters["outcome"] })}
      />
      <FilterSelect
        label="Language"
        allLabel="All languages"
        value={filters.language}
        options={languageOptions}
        onValueChange={(language) => onChange({ language: language as CallFilters["language"] })}
      />
      <FilterSelect
        label="Date"
        allLabel="All time"
        value={filters.range === "all" ? "" : filters.range}
        options={dateRanges.filter((range) => range.value !== "all")}
        onValueChange={(range) => onChange({ range: (range || "all") as CallFilters["range"] })}
      />
    </TableToolbar>
  );
}
