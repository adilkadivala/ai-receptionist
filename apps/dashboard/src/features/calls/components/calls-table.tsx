import type { ReactNode } from "react";
import { type Column, DataTable } from "../../../components/data-table";
import { formatDateTime, formatDuration, formatPhone, formatRelative } from "../../../lib/format";
import type { Call } from "../types";
import { CallLink } from "./call-link";
import { OutcomeBadge } from "./outcome-badge";

const columns: Column<Call>[] = [
  {
    id: "caller",
    header: "Caller",
    cell: (call) => (
      <div className="flex flex-col items-start gap-0.5">
        <CallLink call={call} />
        <span className="text-xs text-muted-foreground tabular-nums">
          {call.caller_name ? formatPhone(call.from_number) : "No name given"}
          <span className="md:hidden"> · {formatRelative(call.started_at)}</span>
        </span>
        {/* Phones have room for one column, so the outcome moves under the caller. */}
        <OutcomeBadge outcome={call.outcome} className="mt-1 sm:hidden" />
      </div>
    ),
  },
  {
    id: "outcome",
    header: "Outcome",
    className: "hidden sm:table-cell",
    cell: (call) => <OutcomeBadge outcome={call.outcome} />,
  },
  {
    id: "summary",
    header: "Summary",
    className: "hidden w-full max-w-0 lg:table-cell",
    cell: (call) => <p className="truncate text-muted-foreground">{call.summary ?? "Summary on its way…"}</p>,
  },
  {
    id: "language",
    header: "Language",
    className: "hidden sm:table-cell",
    cell: (call) => call.language ?? <span className="text-muted-foreground">—</span>,
  },
  {
    id: "when",
    header: "When",
    className: "hidden md:table-cell",
    cell: (call) => <time dateTime={call.started_at}>{formatDateTime(call.started_at)}</time>,
  },
  {
    id: "duration",
    header: "Length",
    className: "hidden text-end tabular-nums sm:table-cell",
    cell: (call) => formatDuration(call.duration_seconds),
  },
];

export function CallsTable({
  calls,
  loading,
  empty,
}: {
  calls: readonly Call[] | undefined;
  loading: boolean;
  empty: ReactNode;
}) {
  return (
    <DataTable
      caption="Calls, newest first. Open a call for its summary and transcript."
      columns={columns}
      rows={calls}
      getRowId={(call) => call.id}
      loading={loading}
      empty={empty}
      loadingRows={8}
    />
  );
}
