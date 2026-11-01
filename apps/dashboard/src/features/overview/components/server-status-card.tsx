import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Badge } from "@receptionist/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { useHealth } from "../api";

/** Whether the dashboard can reach the api, and which provider keys the server still needs. */
export function ServerStatusCard() {
  const health = useHealth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server status</CardTitle>
        <CardDescription>Whether the dashboard can reach the api, and which provider keys are set.</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
