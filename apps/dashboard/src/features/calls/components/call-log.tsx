import { Button, buttonVariants } from "@receptionist/ui/components/button";
import { Card, CardContent } from "@receptionist/ui/components/card";
import { PhoneIncoming, SearchX } from "lucide-react";
import { useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { EmptyState } from "../../../components/empty-state";
import { Pager } from "../../../components/pager";
import { QueryError } from "../../../components/query-error";
import { useCalls } from "../api";
import { defaultFilters, filtersFromParams, filtersToParams, hasFilters } from "../filter";
import type { CallFilters } from "../types";
import { CallFiltersBar } from "./call-filters";
import { CallsTable } from "./calls-table";

/** The searchable call list. Filters and the page live in the URL. */
export function CallLog() {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params);
  const calls = useCalls(filters);

  const update = useCallback(
    (patch: Partial<CallFilters>) => {
      // Any change other than the page starts again from page 1.
      const next = { ...filtersFromParams(params), page: 1, ...patch };
      setParams(filtersToParams(next), { replace: !("page" in patch) });
    },
    [params, setParams],
  );

  const filtered = hasFilters(filters);
  const empty = filtered ? (
    <EmptyState
      icon={SearchX}
      title="No calls match"
      action={
        <Button variant="outline" onClick={() => update(defaultFilters)}>
          Clear filters
        </Button>
      }
    >
      Try another search, or widen the date range.
    </EmptyState>
  ) : (
    <EmptyState
      icon={PhoneIncoming}
      title="No calls yet"
      action={
        <Link to="/numbers" className={buttonVariants({ variant: "outline" })}>
          Check your phone numbers
        </Link>
      }
    >
      Calls show up here a few seconds after they end, with a summary and the full transcript.
    </EmptyState>
  );

  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <CallFiltersBar filters={filters} onChange={update} />
        {calls.isError ? (
          <QueryError title="Couldn't load your calls" onRetry={() => calls.refetch()} />
        ) : (
          <div aria-busy={calls.isPlaceholderData} className="transition-opacity aria-busy:opacity-60">
            <CallsTable calls={calls.data?.items} loading={calls.isPending} empty={empty} />
          </div>
        )}
        {calls.data && (
          <Pager
            page={calls.data.page}
            pageSize={calls.data.page_size}
            total={calls.data.total}
            onPageChange={(page) => update({ page })}
          />
        )}
      </CardContent>
    </Card>
  );
}
