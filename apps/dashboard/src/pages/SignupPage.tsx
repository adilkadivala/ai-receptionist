import { Badge } from "@receptionist/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { useSearchParams } from "react-router";

export function SignupPage() {
  const [params] = useSearchParams();
  const plan = params.get("plan") ?? "starter";

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Plan:{" "}
            <Badge variant="secondary" className="capitalize">
              {plan}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground">Sign-up arrives with login in build step 6.</CardContent>
      </Card>
    </main>
  );
}
