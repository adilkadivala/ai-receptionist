import { toast } from "sonner";
import { PageHeader } from "../components/page-header";
import { QueryError } from "../components/query-error";
import { usePhoneNumbers } from "../features/numbers/api";
import { AddNumberDialog } from "../features/numbers/components/add-number-dialog";
import { NumbersTable } from "../features/numbers/components/numbers-table";
import { useAgents } from "../features/receptionist/api";
import { formatPhone } from "../lib/format";

export function NumbersPage() {
  const numbers = usePhoneNumbers();
  const agents = useAgents();

  return (
    <>
      <PageHeader
        actions={
          agents.data && (
            <AddNumberDialog
              agents={agents.data}
              onAdded={(number) =>
                toast.success(`${formatPhone(number.e164)} is ready`, {
                  description: number.agent_id
                    ? "Calls to it are answered from now on. This is a sample number."
                    : "Choose who answers it below. This is a sample number.",
                })
              }
            />
          )
        }
      >
        Your numbers and which receptionist answers each one.
      </PageHeader>
      {numbers.isError ? (
        <QueryError title="Couldn't load your numbers" onRetry={() => numbers.refetch()} />
      ) : (
        <section aria-label="Phone numbers" className="rounded-xl border bg-card shadow-xs">
          <NumbersTable numbers={numbers.data} agents={agents.data ?? []} loading={numbers.isPending} />
        </section>
      )}
    </>
  );
}
