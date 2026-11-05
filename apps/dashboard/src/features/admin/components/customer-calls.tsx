import { cn } from "@receptionist/ui/lib/utils";
import { PhoneIncoming } from "lucide-react";
import { Link, useLocation } from "react-router";
import { type Column, DataTable } from "../../../components/data-table";
import { EmptyState } from "../../../components/empty-state";
import { Pager } from "../../../components/pager";
import { QueryError } from "../../../components/query-error";
import { floating } from "../../../components/surfaces";
import { formatCallTime, formatDuration, formatPhone } from "../../../lib/format";
import { OutcomeBadge } from "../../calls/components/outcome-badge";
import { useAdminCalls } from "../api";
import { knownOutcome, languageName } from "../format";
import type { AdminCallRow } from "../types";

export const callsPageSize = 25;

/** Who called, as a link to the call that covers its whole row. Keeps the page number, so closing returns to it. */
function CallerLink({ customerId, call }: { customerId: string; call: AdminCallRow }) {
  const { search } = useLocation();

  return (
    <Link
      to={{ pathname: `/admin/customers/${customerId}/calls/${call.id}`, search }}
      data-call-id={call.id}
      className="truncate font-mono font-medium tabular-nums outline-none after:absolute after:inset-0 after:rounded-md hover:underline focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
    >
      {formatPhone(call.from_number)}
    </Link>
  );
}

/** One customer's calls, newest first, a page at a time. The page is in the URL (?page=2). */
export function CustomerCalls({
  customerId,
  page,
  onPageChange,
}: {
  customerId: string;
  page: number;
  onPageChange: (page: number) => void;
}) {
  const calls = useAdminCalls(customerId, page, callsPageSize);

  const columns: Column<AdminCallRow>[] = [
    {
      id: "when",
      header: "When",
      className: "hidden @xl/main:table-cell",
      cellClassName: "text-[13px] whitespace-nowrap text-foreground/80",
      cell: (call) => <time dateTime={call.started_at}>{formatCallTime(call.started_at)}</time>,
    },
    {
      id: "caller",
      header: "Caller",
      className: "w-full max-w-0",
      cell: (call) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <CallerLink customerId={customerId} call={call} />
          {/* On narrow screens the time moves here, under the number, and the When column goes. */}
          <span className="truncate text-xs text-muted-foreground">
            <time dateTime={call.started_at} className="@xl/main:hidden">
              {formatCallTime(call.started_at)}
              {call.headline && " · "}
            </time>
            {call.headline}
          </span>
        </div>
      ),
    },
    {
      id: "dialed",
      header: "Number dialed",
      className: "hidden @4xl/main:table-cell",
      cellClassName: "font-mono text-[13px] whitespace-nowrap text-foreground/80 tabular-nums",
      cell: (call) => formatPhone(call.to_number),
    },
    {
      id: "language",
      header: "Language",
      className: "hidden @3xl/main:table-cell",
      cellClassName: "text-[13px] text-foreground/80",
      cell: (call) => languageName(call.language),
    },
    {
      id: "length",
      header: "Length",
      className: "hidden text-end @lg/main:table-cell",
      cellClassName: "font-mono text-[13px] tabular-nums",
      cell: (call) => formatDuration(call.duration_seconds),
    },
    {
      id: "outcome",
      header: "Outcome",
      className: "text-end",
      cell: (call) => <OutcomeBadge outcome={knownOutcome(call.outcome)} emptyLabel={call.outcome ?? "No outcome"} />,
    },
  ];

  if (calls.isError) return <QueryError title="Couldn't load this customer's calls" onRetry={() => calls.refetch()} />;

  return (
    // The page's Calls section names it, so the card itself is no landmark of its own.
    <div className={cn(floating, "flex min-w-0 flex-col overflow-hidden")}>
      <div aria-busy={calls.isPlaceholderData} className="transition-opacity aria-busy:opacity-60">
        <DataTable
          caption="This customer's calls, newest first."
          columns={columns}
          rows={calls.data?.items}
          getRowId={(call) => call.id}
          loading={calls.isPending}
          loadingRows={5}
          empty={
            <EmptyState icon={PhoneIncoming} title="No calls yet">
              Calls show up here once they've ended and been saved.
            </EmptyState>
          }
        />
      </div>
      {calls.data && calls.data.total > 0 && (
        <Pager
          page={calls.data.page}
          pageSize={calls.data.page_size}
          total={calls.data.total}
          noun="calls"
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
