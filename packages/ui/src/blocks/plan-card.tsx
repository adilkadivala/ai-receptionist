import { Badge } from "@receptionist/ui/components/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@receptionist/ui/components/card";
import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";

// Matches the Plan type in @receptionist/product without making the ui package depend on it.
type PlanSummary = { name: string; price: number; minutes: number; for: string; featured?: boolean };

/**
 * One plan with its price and included minutes. The landing page passes a sign-up link as `action`,
 * the dashboard a button to choose or change plan.
 */
export function PlanCard({
  plan,
  action,
  badge = plan.featured ? "Most popular" : undefined,
  highlighted = plan.featured,
  className,
}: {
  plan: PlanSummary;
  action?: ReactNode;
  badge?: string;
  highlighted?: boolean;
  className?: string;
}) {
  return (
    <Card className={cn(highlighted && "ring-2 ring-primary", className)}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
        <CardDescription>{plan.for}</CardDescription>
        {badge && (
          <CardAction>
            <Badge>{badge}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p>
          <span className="font-heading text-4xl font-semibold">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </p>
        <p className="mt-2">{plan.minutes} call minutes included</p>
      </CardContent>
      {action && <CardFooter>{action}</CardFooter>}
    </Card>
  );
}
