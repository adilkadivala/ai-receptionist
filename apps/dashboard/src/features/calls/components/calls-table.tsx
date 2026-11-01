import { Avatar, AvatarFallback } from "@receptionist/ui/components/avatar";
import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";
import { type Column, DataTable } from "../../../components/data-table";
import { resting } from "../../../components/surfaces";
import { formatCallTime, formatDuration, formatPhone, initials } from "../../../lib/format";
import type { Call } from "../types";
import { CallLink } from "./call-link";
import { CallRowActions } from "./call-row-actions";
import { OutcomeBadge } from "./outcome-badge";

function CallerCell({ call }: { call: Call }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="size-[30px]">
        <AvatarFallback className="text-[11px] font-semibold">
          {call.caller_name ? initials(call.caller_name) : "?"}
        </AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col items-start">
        <CallLink call={call} />
        <span className="font-mono text-xs text-muted-foreground">
          {call.caller_name ? formatPhone(call.from_number) : "No name given"}
        </span>
        {/* Narrow screens have room for one column, so the rest of the row moves under the caller. */}
        <span className="mt-1 max-w-full truncate text-muted-foreground lg:hidden">{call.summary}</span>
        <span className="mt-1.5 flex items-center gap-2 sm:hidden">
          <OutcomeBadge outcome={call.outcome} />
          <time dateTime={call.started_at} className="text-xs text-muted-foreground">
            {formatCallTime(call.started_at)}
          </time>
        </span>
      </div>
    </div>
  );
}

const columns: Column<Call>[] = [
  {
    id: "caller",
    header: "Caller",
    className: "w-full max-w-0 lg:w-auto lg:max-w-none",
    cell: (call) => <CallerCell call={call} />,
  },
  {
    id: "summary",
    header: "What they needed",
    className: "hidden w-full max-w-0 lg:table-cell",
    cell: (call) => <p className="truncate text-foreground/80">{call.summary ?? "Summary on its way…"}</p>,
  },
  {
    id: "language",
    header: "Language",
    className: "hidden md:table-cell",
    cell: (call) =>
      call.language ? (
        <span className={cn("inline-flex h-6 items-center rounded-md px-2 text-xs text-foreground/80", resting)}>
          {call.language}
        </span>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    id: "outcome",
    header: "Outcome",
    className: "hidden sm:table-cell",
    cell: (call) => <OutcomeBadge outcome={call.outcome} />,
  },
  {
    id: "length",
    header: "Length",
    className: "hidden text-end md:table-cell",
    cellClassName: "font-mono text-[13px] text-foreground/80",
    cell: (call) => formatDuration(call.duration_seconds),
  },
  {
    id: "time",
    header: "Time",
    className: "hidden text-end sm:table-cell",
    cellClassName: "text-[13px] text-muted-foreground",
    cell: (call) => <time dateTime={call.started_at}>{formatCallTime(call.started_at)}</time>,
  },
  {
    id: "actions",
    header: <span className="sr-only">Actions</span>,
    className: "w-12 text-end",
    cell: (call) => <CallRowActions call={call} />,
  },
];

export function CallsTable({
  calls,
  loading,
  empty,
  hidden = [],
  loadingRows = 8,
}: {
  calls: readonly Call[] | undefined;
  loading: boolean;
  empty: ReactNode;
  hidden?: readonly string[];
  loadingRows?: number;
}) {
  return (
    <DataTable
      caption="Calls, newest first. Open a call for its summary and transcript."
      columns={columns.filter((column) => !hidden.includes(column.id))}
      rows={calls}
      getRowId={(call) => call.id}
      loading={loading}
      empty={empty}
      loadingRows={loadingRows}
    />
  );
}
