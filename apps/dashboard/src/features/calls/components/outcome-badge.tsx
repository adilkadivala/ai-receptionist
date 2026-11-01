import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { type OutcomeTone, outcomes } from "../outcomes";
import type { CallOutcome } from "../types";

const tones: Record<OutcomeTone, string> = {
  success: "border-transparent bg-success/10 text-success",
  primary: "border-transparent bg-primary/10 text-primary",
  neutral: "border-transparent bg-secondary text-secondary-foreground",
  muted: "text-muted-foreground",
  destructive: "border-transparent bg-destructive/10 text-destructive",
};

export function OutcomeBadge({ outcome, className }: { outcome: CallOutcome | null; className?: string }) {
  if (!outcome)
    return (
      <Badge variant="outline" className={className}>
        In progress
      </Badge>
    );
  const { label, icon: Icon, tone } = outcomes[outcome];

  return (
    <Badge variant="outline" className={cn(tones[tone], className)}>
      <Icon aria-hidden data-icon="inline-start" />
      {label}
    </Badge>
  );
}
