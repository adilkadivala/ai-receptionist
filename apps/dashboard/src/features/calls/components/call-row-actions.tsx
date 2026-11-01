import { Button } from "@receptionist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@receptionist/ui/components/dropdown-menu";
import { Copy, Ellipsis, PanelRightOpen, PhoneOutgoing } from "lucide-react";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { formatPhone } from "../../../lib/format";
import type { Call } from "../types";

/** Open, call back or copy the number, from the end of a call's row. Sits above the row's stretched link. */
export function CallRowActions({ call }: { call: Call }) {
  const { search } = useLocation();
  const who = call.caller_name ?? formatPhone(call.from_number);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`More actions for the call from ${who}`}
            className="relative z-10 text-muted-foreground"
          />
        }
      >
        <Ellipsis />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        <DropdownMenuItem render={<Link to={{ pathname: `/calls/${call.id}`, search }} />}>
          <PanelRightOpen />
          Open call
        </DropdownMenuItem>
        {call.from_number && (
          <>
            <DropdownMenuItem render={<a href={`tel:${call.from_number}`} />}>
              <PhoneOutgoing />
              Call back
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const number = call.from_number ?? "";
                navigator.clipboard?.writeText(number).then(
                  () => toast.success(`Copied ${formatPhone(number)}`),
                  () => toast.error("Couldn't copy the number. Select it in the call instead."),
                );
              }}
            >
              <Copy />
              Copy number
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
