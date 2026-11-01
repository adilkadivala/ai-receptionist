import { Button } from "@receptionist/ui/components/button";
import { CircleX } from "lucide-react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { EmptyState } from "../components/empty-state";
import { NotFoundPage } from "./NotFoundPage";

/** Shown when a page fails to load or render, e.g. after a deploy replaced the file it was loading. */
export function RouteErrorPage() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <EmptyState
        icon={CircleX}
        title="This page didn't load"
        action={<Button onClick={() => window.location.reload()}>Reload</Button>}
      >
        Reloading usually fixes it. If it doesn't, try again in a few minutes.
      </EmptyState>
    </main>
  );
}
