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
 * One plan with its price and included minutes, drawn to the approved mockup: a card standing off the sheet on its own
 * shadow, 28 px padding, 16 px corners, a 17 px name, a 48 px price, the badge in the blue tint and no footer band.
 * The landing page passes a sign-up link as `action`, the dashboard a button to choose or change plan.
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
    <Card
      className={cn(
        "gap-5 rounded-[16px] text-[15px] shadow-(--float) ring-0 [--card-spacing:--spacing(7)]",
        highlighted && "ring-2 ring-primary",
        className,
      )}
    >
      <CardHeader>
        <CardTitle className="text-[17px] leading-snug font-semibold">{plan.name}</CardTitle>
        <CardDescription>{plan.for}</CardDescription>
        {badge && (
          <CardAction>
            <Badge className="h-6 bg-brand-soft px-2.5 text-brand-soft-foreground">{badge}</Badge>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex-1">
        <p>
          <span className="font-heading text-5xl font-semibold tracking-[-0.04em]">${plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </p>
        <p className="mt-5">{plan.minutes} call minutes included</p>
      </CardContent>
      {action && <CardFooter className="border-t-0 bg-transparent pt-0">{action}</CardFooter>}
    </Card>
  );
}
