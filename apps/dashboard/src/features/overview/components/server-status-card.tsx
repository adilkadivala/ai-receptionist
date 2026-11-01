import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Badge } from "@receptionist/ui/components/badge";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { SectionTitle } from "../../../components/section-title";
import { raised } from "../../../components/surfaces";
import { useHealth } from "../api";

/** Whether the dashboard can reach the api, and which provider keys the server still needs. */
export function ServerStatusCard() {
  const health = useHealth();

  return (
    <section aria-labelledby="server-status-title" className={cn(raised, "flex flex-col gap-4 p-5")}>
      <SectionTitle
        id="server-status-title"
        title="Server status"
        description="Whether the dashboard can reach the api, and which provider keys are set."
      />
      <div>
        {health.isPending && <Skeleton className="h-14 w-full" />}
        {health.isError && (
          <Alert variant="destructive">
            <CircleX />
            <AlertTitle>Can't reach the api</AlertTitle>
            <AlertDescription>Is it running on port 8000?</AlertDescription>
          </Alert>
        )}
        {health.data &&
          (health.data.missing.length === 0 ? (
            <Alert>
              <CircleCheck />
              <AlertTitle>Connected</AlertTitle>
              <AlertDescription>Every provider key is set.</AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <TriangleAlert />
              <AlertTitle>Connected, but some provider keys are missing</AlertTitle>
              <AlertDescription>
                <p>Calls can't be answered until these are set in the server's .env file:</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {health.data.missing.map((key) => (
                    <li key={key}>
                      <Badge variant="outline" className="font-mono">
                        {key}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          ))}
      </div>
    </section>
  );
}
