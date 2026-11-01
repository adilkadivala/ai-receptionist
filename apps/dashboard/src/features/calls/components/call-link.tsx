import { Link, useLocation } from "react-router";
import { formatPhone } from "../../../lib/format";
import type { Call } from "../types";

/** Who called, as a link to the call. It stretches over its whole row, so the row is the click target. */
export function CallLink({ call }: { call: Pick<Call, "id" | "caller_name" | "from_number"> }) {
  // Keep the list's filters, so closing the call returns to the same view.
  const { search } = useLocation();

  return (
    <Link
      to={{ pathname: `/calls/${call.id}`, search: search.length > 1 ? search : "" }}
      data-call-id={call.id}
      className="font-medium outline-none after:absolute after:inset-0 after:rounded-md hover:underline focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
    >
      {call.caller_name ?? formatPhone(call.from_number)}
    </Link>
  );
}
