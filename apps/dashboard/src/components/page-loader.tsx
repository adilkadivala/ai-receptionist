import { Spinner } from "@receptionist/ui/components/spinner";

/** Fills the screen while the first page's code loads. */
export function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  );
}
