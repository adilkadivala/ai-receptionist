import { cn } from "@receptionist/ui/lib/utils";
import type { HTMLAttributes } from "react";
import type { Outcome } from "@/content/demo-calls";

// The call-outcome colours: the only place status colours appear.
const tones: Record<Outcome, string> = {
  booked: "bg-success-soft text-success-foreground",
  transferred: "bg-brand-soft text-brand-soft-foreground",
  message: "bg-warning-soft text-warning-foreground",
  spam: "bg-muted text-muted-foreground",
};

export const outcomeLabels: Record<Outcome, string> = {
  booked: "Booked",
  transferred: "Transferred",
  message: "Message taken",
  spam: "Spam blocked",
};

export function OutcomePill({
  outcome,
  className,
  children = outcomeLabels[outcome],
  ...props
}: HTMLAttributes<HTMLSpanElement> & { outcome: Outcome }) {
  return (
    <span
      className={cn(
        "inline-flex h-5.5 items-center rounded-full px-2 text-xs font-medium whitespace-nowrap",
        tones[outcome],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
