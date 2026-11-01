import { Badge } from "@receptionist/ui/components/badge";
import { TriangleAlert } from "lucide-react";
import { toast } from "sonner";
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
          <span className="font-mono font-medium tabular-nums">{formatPhone(number.e164)}</span>
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
            onValueChange={(agent_id) =>
              assign.mutate(
                { id: number.id, agent_id },
                {
                  onSuccess: () =>
                    toast.success(
                      agent_id
                        ? `${agents.find((agent) => agent.id === agent_id)?.name ?? "Your receptionist"} now answers ${formatPhone(number.e164)}`
                        : `Calls to ${formatPhone(number.e164)} are no longer answered`,
                    ),
                  onError: () => toast.error("Couldn't change who answers. Nothing changed on your calls."),
                },
              )
            }
            disabled={assign.isPending && assign.variables?.id === number.id}
            aria-label={`Who answers ${formatPhone(number.e164)}`}
          />
          {!number.agent_id && (
            <Badge
              variant="outline"
              className="h-6 gap-1.5 border-transparent bg-warning-soft px-2.5 text-warning-foreground"
            >
              <TriangleAlert data-icon="inline-start" />
              Calls aren't answered
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "country",
      header: "Country",
      className: "hidden sm:table-cell",
      cell: (number) => <span className="font-mono text-[13px] text-foreground/80">{number.country}</span>,
    },
    {
      id: "added",
      header: "Added",
      className: "hidden text-end md:table-cell",
      cellClassName: "text-[13px] text-muted-foreground",
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
