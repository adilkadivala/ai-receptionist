import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@receptionist/ui/components/sheet";
import { useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router";
import { FrameRule } from "../../../components/frame-rule";
import { QueryError } from "../../../components/query-error";
import { formatDateTime, formatPhone } from "../../../lib/format";
import { useCall } from "../api";
import { CallDetail, CallDetailSkeleton } from "./call-detail";

/** The call at /calls/:id, in a sheet over the list. Closing it returns to the list with its filters. */
export function CallSheet() {
  const match = useMatch("/calls/:id");
  const navigate = useNavigate();
  const { search } = useLocation();
  const id = match?.params.id;
  // Keep the last call while the sheet slides out, so it doesn't go blank on the way.
  const [shownId, setShownId] = useState(id);
  if (id && id !== shownId) setShownId(id);

  return (
    <Sheet open={Boolean(id)} onOpenChange={(open) => !open && navigate({ pathname: "/calls", search })}>
      <SheetContent
        className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        // The sheet has no trigger button, so give focus back to the call's link in the list.
        finalFocus={() => document.querySelector<HTMLElement>(`[data-call-id="${shownId}"]`) ?? true}
      >
        {shownId && <CallSheetBody id={shownId} />}
      </SheetContent>
    </Sheet>
  );
}

function CallSheetBody({ id }: { id: string }) {
  const call = useCall(id);

  return (
    <>
      <SheetHeader className="relative pe-12">
        <SheetTitle className="text-base font-semibold tracking-[-0.01em]">
          {call.data ? (call.data.caller_name ?? formatPhone(call.data.from_number)) : "Call"}
        </SheetTitle>
        <SheetDescription>{call.data ? formatDateTime(call.data.started_at) : " "}</SheetDescription>
        <FrameRule />
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-4">
        {call.isPending && <CallDetailSkeleton />}
        {call.isError && (
          <QueryError title="This call isn't available">It may have been deleted, or the link is wrong.</QueryError>
        )}
        {call.data && <CallDetail call={call.data} />}
      </div>
    </>
  );
}
