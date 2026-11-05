import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@receptionist/ui/components/sheet";
import { useState } from "react";
import { useLocation, useMatch, useNavigate } from "react-router";
import { FrameRule } from "../../../components/frame-rule";
import { QueryError } from "../../../components/query-error";
import { formatDateTime, formatPhone } from "../../../lib/format";
import { useAdminCall } from "../api";
import { readSummary } from "../format";
import { AdminCallDetail, AdminCallDetailSkeleton } from "./call-detail";

/**
 * The call at /admin/customers/:id/calls/:callId, in a sheet over the customer's page, as the customer dashboard opens
 * a call over its list. Closing it returns to the same page of calls.
 */
export function AdminCallSheet({ customerName }: { customerName?: string }) {
  const match = useMatch("/admin/customers/:id/calls/:callId");
  const navigate = useNavigate();
  const { search } = useLocation();
  const customerId = match?.params.id;
  const callId = match?.params.callId;
  // Keep the last call while the sheet slides out, so it doesn't go blank on the way.
  const [shown, setShown] = useState(customerId && callId ? { customerId, callId } : undefined);
  if (customerId && callId && (customerId !== shown?.customerId || callId !== shown?.callId)) {
    setShown({ customerId, callId });
  }

  return (
    <Sheet
      open={Boolean(callId)}
      onOpenChange={(open) => !open && shown && navigate({ pathname: `/admin/customers/${shown.customerId}`, search })}
    >
      <SheetContent
        className="w-full gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-lg"
        // The sheet has no trigger button, so give focus back to the call's link in the list.
        finalFocus={() => document.querySelector<HTMLElement>(`[data-call-id="${shown?.callId}"]`) ?? true}
      >
        {shown && <AdminCallSheetBody {...shown} customerName={customerName} />}
      </SheetContent>
    </Sheet>
  );
}

function AdminCallSheetBody({
  customerId,
  callId,
  customerName,
}: {
  customerId: string;
  callId: string;
  customerName?: string;
}) {
  const call = useAdminCall(customerId, callId);
  const caller = call.data && (readSummary(call.data.summary)?.caller_name ?? formatPhone(call.data.from_number));

  return (
    <>
      <SheetHeader className="relative pe-12">
        <SheetTitle className="text-base font-semibold tracking-[-0.01em]">{caller ?? "Call"}</SheetTitle>
        <SheetDescription>
          {call.data ? [customerName, formatDateTime(call.data.started_at)].filter(Boolean).join(" · ") : " "}
        </SheetDescription>
        <FrameRule />
      </SheetHeader>
      <div className="flex-1 overflow-y-auto p-4">
        {call.isPending && <AdminCallDetailSkeleton />}
        {call.isError && (
          <QueryError title="This call isn't available">
            It may belong to another customer, or the link is wrong.
          </QueryError>
        )}
        {call.data && <AdminCallDetail call={call.data} customerName={customerName} />}
      </div>
    </>
  );
}
