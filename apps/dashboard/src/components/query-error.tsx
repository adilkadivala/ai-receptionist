import { Alert, AlertAction, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Button } from "@receptionist/ui/components/button";
import { CircleX } from "lucide-react";
import type { ReactNode } from "react";

/** What to show when a query fails, with a retry. */
export function QueryError({
  title,
  children = "Check your connection and try again.",
  onRetry,
}: {
  title: string;
  children?: ReactNode;
  onRetry?: () => void;
}) {
  return (
    <Alert variant="destructive">
      <CircleX />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{children}</AlertDescription>
      {onRetry && (
        <AlertAction>
          <Button size="sm" variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </AlertAction>
      )}
    </Alert>
  );
}
