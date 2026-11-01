import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { type OutcomeTone, outcomes } from "../outcomes";
import type { CallOutcome } from "../types";

// The landing page's outcome pills: a tint with its text, no border. The only place status colours appear.
const tones: Record<OutcomeTone, string> = {
  success: "bg-success-soft text-success-foreground",
  brand: "bg-brand-soft text-brand-soft-foreground",
  warning: "bg-warning-soft text-warning-foreground",
  neutral: "bg-card text-foreground shadow-(--raised)",
  muted: "bg-muted text-muted-foreground",
  destructive: "bg-destructive/10 text-destructive",
};

/** How a call ended, as a pill. */
export function OutcomeBadge({ outcome, className }: { outcome: CallOutcome | null; className?: string }) {
  const { label, tone } = outcome ? outcomes[outcome] : { label: "In progress", tone: "neutral" as const };

  return <Badge className={cn("h-6 border-transparent px-2.5", tones[tone], className)}>{label}</Badge>;
}
