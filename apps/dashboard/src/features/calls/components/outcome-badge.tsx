import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { type OutcomeTone, outcomes } from "../outcomes";
import type { CallOutcome } from "../types";

const tones: Record<OutcomeTone, { pill: string; dot: string }> = {
  success: { pill: "border-transparent bg-success-soft text-success-foreground", dot: "bg-success" },
  brand: { pill: "border-transparent bg-brand-soft text-brand-soft-foreground", dot: "bg-primary" },
  warning: { pill: "border-transparent bg-warning-soft text-warning-foreground", dot: "bg-warning" },
  neutral: { pill: "border-border text-foreground", dot: "bg-muted-foreground" },
  muted: { pill: "border-transparent bg-muted text-muted-foreground", dot: "bg-muted-foreground/60" },
  destructive: { pill: "border-transparent bg-destructive/10 text-destructive", dot: "bg-destructive" },
};

/** How a call ended, as a pill with a coloured dot. */
export function OutcomeBadge({ outcome, className }: { outcome: CallOutcome | null; className?: string }) {
  const { label, tone } = outcome ? outcomes[outcome] : { label: "In progress", tone: "neutral" as const };

  return (
    <Badge variant="outline" className={cn("h-6 gap-1.5 px-2.5", tones[tone].pill, className)}>
      <span aria-hidden className={cn("size-1.5 rounded-full", tones[tone].dot)} />
      {label}
    </Badge>
  );
}
