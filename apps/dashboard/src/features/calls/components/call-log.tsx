import { Button, buttonVariants } from "@receptionist/ui/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@receptionist/ui/components/tabs";
import { cn } from "@receptionist/ui/lib/utils";
import { PhoneIncoming, SearchX } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "../../../components/empty-state";
import { Pager } from "../../../components/pager";
import { QueryError } from "../../../components/query-error";
import { useStoredState } from "../../../hooks/use-stored-state";
import { formatNumber } from "../../../lib/format";
import { useCalls, useCallsToday } from "../api";
import type { OptionalColumn } from "../columns";
import { hasFilters } from "../filter";
import { outcomes, tabbedOutcomes } from "../outcomes";
import type { CallFilters, CallOutcome, OutcomeCounts } from "../types";
import { CallSearchField, ColumnsMenu, LanguageFilter } from "./call-filters";
import { CallsTable } from "./calls-table";

function CountChip({ children, tone }: { children: string; tone?: "warning" }) {
  return (
    <span
      className={cn(
        "rounded-md bg-muted px-1.5 py-px font-mono text-[11px] font-normal text-muted-foreground tabular-nums",
        tone === "warning" && "bg-warning-soft text-warning-foreground",
      )}
    >
      {children}
    </span>
  );
}

function OutcomeTabs({ counts, current }: { counts: OutcomeCounts | undefined; current: CallOutcome | "" }) {
  const newMessages = useCallsToday().data?.messages ?? 0;
  // An outcome without a tab of its own (from a link, say) still gets one while it's selected.
  const tabs = current && !tabbedOutcomes.includes(current) ? [...tabbedOutcomes, current] : tabbedOutcomes;
  const count = (value: number | undefined) => (counts ? formatNumber(value ?? 0) : "–");

  return (
    <TabsList
      variant="line"
      aria-label="Call outcome"
      className="-mb-px h-auto gap-5 overflow-x-auto overflow-y-hidden p-0 [scrollbar-width:none]"
    >
      <TabsTrigger value="all" className="h-12 flex-none px-0 after:bottom-0! after:bg-primary">
        All calls <CountChip>{count(counts?.all)}</CountChip>
      </TabsTrigger>
      {tabs.map((outcome) => (
        <TabsTrigger key={outcome} value={outcome} className="h-12 flex-none px-0 after:bottom-0! after:bg-primary">
          {outcomes[outcome].tab ?? outcomes[outcome].label}{" "}
          {outcome === "message" && newMessages > 0 ? (
            <CountChip tone="warning">{`${newMessages} new`}</CountChip>
          ) : (
            <CountChip>{count(counts?.[outcome])}</CountChip>
          )}
        </TabsTrigger>
      ))}
    </TabsList>
  );
}

/**
 * The call table with its outcome tabs, filters and pages, as on dashboard-01. The Overview shows the newest few;
 * the Calls page adds search. Filters belong to the page (in its URL), so this takes them as props.
 */
export function CallLog({
  label,
  filters,
  defaults,
  onChange,
  pageSize,
  searchable = false,
}: {
  /** Names the section for screen readers. */
  label: string;
  filters: CallFilters;
  /** The page's starting filters, for "Clear filters". */
  defaults: CallFilters;
  onChange: (patch: Partial<CallFilters>) => void;
  pageSize: number;
  searchable?: boolean;
}) {
  const calls = useCalls(filters, pageSize);
  const [hidden, setHidden] = useStoredState<OptionalColumn[]>("calls-table.hidden-columns", []);

  const empty = hasFilters(filters, defaults) ? (
    <EmptyState
      icon={SearchX}
      title="No calls match"
      action={
        <Button variant="outline" onClick={() => onChange(defaults)}>
          Clear filters
        </Button>
      }
    >
      Try another search or outcome, or a longer date range.
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
    <section aria-label={label} className="flex min-w-0 flex-col rounded-xl border bg-card shadow-xs">
      <Tabs
        value={filters.outcome || "all"}
        onValueChange={(value) => onChange({ outcome: value === "all" ? "" : (value as CallOutcome) })}
      >
        <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-border/70 px-4 lg:px-5">
          <OutcomeTabs counts={calls.data?.outcome_counts} current={filters.outcome} />
          <div className="flex w-full flex-wrap items-center gap-2 pb-3 sm:w-auto sm:py-2">
            {searchable && <CallSearchField value={filters.q} onChange={(q) => onChange({ q })} />}
            <LanguageFilter value={filters.language} onChange={(language) => onChange({ language })} />
            <ColumnsMenu hidden={hidden} onHiddenChange={setHidden} />
          </div>
        </div>
        <TabsContent value={filters.outcome || "all"}>
          {calls.isError ? (
            <div className="p-4">
              <QueryError title="Couldn't load your calls" onRetry={() => calls.refetch()} />
            </div>
          ) : (
            <div aria-busy={calls.isPlaceholderData} className="transition-opacity aria-busy:opacity-60">
              <CallsTable
                calls={calls.data?.items}
                loading={calls.isPending}
                empty={empty}
                hidden={hidden}
                loadingRows={pageSize}
              />
            </div>
          )}
          {calls.data && calls.data.total > 0 && (
            <Pager
              page={calls.data.page}
              pageSize={calls.data.page_size}
              total={calls.data.total}
              noun="calls"
              onPageChange={(page) => onChange({ page })}
            />
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}
