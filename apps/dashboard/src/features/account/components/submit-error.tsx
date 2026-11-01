import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { CircleX, Info } from "lucide-react";
import { NotLiveYetError } from "../api";

/** Explains a failed sign-up or login: either the route doesn't exist yet, or something went wrong. */
export function SubmitError({ error }: { error: Error }) {
  if (error instanceof NotLiveYetError) {
    return (
      <Alert>
        <Info />
        <AlertTitle>Not open yet</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  return (
    <Alert variant="destructive">
      <CircleX />
      <AlertTitle>Something went wrong</AlertTitle>
      <AlertDescription>Nothing was saved. Try again in a moment.</AlertDescription>
    </Alert>
  );
}
