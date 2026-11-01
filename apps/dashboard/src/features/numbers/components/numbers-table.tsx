import { Badge } from "@receptionist/ui/components/badge";
import { TriangleAlert } from "lucide-react";
import { type Column, DataTable } from "../../../components/data-table";
import { formatDate, formatPhone } from "../../../lib/format";
import type { Agent } from "../../receptionist/types";
import { useAssignNumber } from "../api";
import type { PhoneNumber } from "../types";
import { AgentSelect } from "./agent-select";

export function NumbersTable({
  numbers,
  agents,
  loading,
}: {
  numbers: readonly PhoneNumber[] | undefined;
  agents: readonly Agent[];
  loading: boolean;
}) {
  const assign = useAssignNumber();

  const columns: Column<PhoneNumber>[] = [
    {
      id: "number",
      header: "Number",
      cell: (number) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium tabular-nums">{formatPhone(number.e164)}</span>
          <span className="text-xs text-muted-foreground">{number.label ?? "No name"}</span>
        </div>
      ),
    },
    {
      id: "agent",
      header: "Answered by",
      cell: (number) => (
        <div className="flex flex-wrap items-center gap-2">
          <AgentSelect
            agents={agents}
            value={number.agent_id}
            onValueChange={(agent_id) => assign.mutate({ id: number.id, agent_id })}
            disabled={assign.isPending && assign.variables?.id === number.id}
            aria-label={`Who answers ${formatPhone(number.e164)}`}
          />
          {!number.agent_id && (
            <Badge variant="outline" className="border-transparent bg-warning/10 text-warning">
              <TriangleAlert data-icon="inline-start" />
              Calls aren't answered
            </Badge>
          )}
        </div>
      ),
    },
    { id: "country", header: "Country", className: "hidden sm:table-cell", cell: (number) => number.country },
    {
      id: "added",
      header: "Added",
      className: "hidden md:table-cell",
      cell: (number) => <time dateTime={number.created_at}>{formatDate(number.created_at)}</time>,
    },
  ];

  return (
    <DataTable
      caption="Your phone numbers and which receptionist answers each one."
      columns={columns}
      rows={numbers}
      getRowId={(number) => number.id}
      loading={loading}
      loadingRows={2}
    />
  );
}
