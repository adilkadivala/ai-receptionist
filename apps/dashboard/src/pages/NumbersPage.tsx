import { Alert, AlertAction, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Button } from "@receptionist/ui/components/button";
import { Card, CardContent } from "@receptionist/ui/components/card";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "../components/page-header";
import { QueryError } from "../components/query-error";
import { usePhoneNumbers } from "../features/numbers/api";
import { AddNumberDialog } from "../features/numbers/components/add-number-dialog";
import { NumbersTable } from "../features/numbers/components/numbers-table";
import type { PhoneNumber } from "../features/numbers/types";
import { useAgents } from "../features/receptionist/api";
import { formatPhone } from "../lib/format";

export function NumbersPage() {
  const numbers = usePhoneNumbers();
  const agents = useAgents();
  const [added, setAdded] = useState<PhoneNumber>();

  return (
    <>
      <PageHeader
        title="Phone numbers"
        actions={agents.data && <AddNumberDialog agents={agents.data} onAdded={setAdded} />}
      >
        Your numbers and which receptionist answers each one.
      </PageHeader>
      <div className="flex flex-col gap-4">
        {added && (
          <Alert role="status">
            <CircleCheck />
            <AlertTitle>{formatPhone(added.e164)} is ready</AlertTitle>
            <AlertDescription>Calls to it are answered from now on. This is a sample number.</AlertDescription>
            <AlertAction>
              <Button size="sm" variant="ghost" onClick={() => setAdded(undefined)}>
                Dismiss
              </Button>
            </AlertAction>
          </Alert>
        )}
        {numbers.isError ? (
          <QueryError title="Couldn't load your numbers" onRetry={() => numbers.refetch()} />
        ) : (
          <Card>
            <CardContent>
              <NumbersTable numbers={numbers.data} agents={agents.data ?? []} loading={numbers.isPending} />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
