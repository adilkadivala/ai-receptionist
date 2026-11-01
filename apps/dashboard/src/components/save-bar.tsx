import { Button } from "@receptionist/ui/components/button";
import { Spinner } from "@receptionist/ui/components/spinner";
import type { ReactNode } from "react";

/** Sticks to the bottom of a long settings form: what's saved, and the Discard and Save buttons. */
export function SaveBar({
  status,
  dirty,
  saving,
  onDiscard,
}: {
  /** Read out by screen readers when it changes. */
  status: ReactNode;
  dirty: boolean;
  saving: boolean;
  onDiscard: () => void;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-auto -mb-5 border-t bg-card/95 px-4 py-3 backdrop-blur-sm lg:-mx-6 lg:-mb-6 lg:px-6 md:rounded-b-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">
          {status}
        </p>
        <div className="ms-auto flex gap-2">
          <Button type="button" variant="ghost" disabled={!dirty || saving} onClick={onDiscard}>
            Discard
          </Button>
          <Button type="submit" disabled={!dirty || saving}>
            {saving && <Spinner data-icon="inline-start" />}
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
