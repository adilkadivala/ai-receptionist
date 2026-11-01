import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Badge } from "@receptionist/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { PageHeader } from "../layouts/AppLayout";
import { api } from "../lib/api";

export function OverviewPage() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/health");
      if (error || !data) throw new Error("The api didn't answer");
      return data;
    },
  });

  return (
    <>
      <PageHeader title="Overview">Calls answered, minutes used and anything that needs your attention.</PageHeader>
      <Card className="max-w-2xl">
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
    </>
  );
}
