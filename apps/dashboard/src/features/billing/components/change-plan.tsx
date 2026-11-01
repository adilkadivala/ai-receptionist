import { contractFromPerMinute, formatUsd, included, overagePerMinute, type Plan, plans } from "@receptionist/product";
import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@receptionist/ui/components/alert-dialog";
import { Button } from "@receptionist/ui/components/button";
import { Spinner } from "@receptionist/ui/components/spinner";
import { cn } from "@receptionist/ui/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { SectionTitle } from "../../../components/section-title";
import { resting } from "../../../components/surfaces";
import { useChangePlan, useSubscription } from "../api";

/** Every self-serve plan, with a confirmation before switching. */
export function ChangePlan() {
  const subscription = useSubscription();
  const change = useChangePlan();
  const [target, setTarget] = useState<Plan>();
  const current = subscription.data?.plan;

  function confirm() {
    if (!target) return;
    change.mutate(target.id, {
      onSuccess: () => {
        toast.success(`You're on ${target.name}`, {
          description: `${target.minutes} minutes a month from now on. This is sample data: real plan changes arrive with payments.`,
        });
        setTarget(undefined);
      },
      onError: () => toast.error("Couldn't change your plan. Nothing was charged."),
    });
  }

  return (
    <section id="change-plan" aria-labelledby="change-plan-title" className="flex scroll-mt-20 flex-col gap-4">
      <SectionTitle
        id="change-plan-title"
        title="Change plan"
        description={`Every plan includes ${included.join(", ").toLowerCase()}. Extra minutes are ${formatUsd(overagePerMinute)} each.`}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            highlighted={plan.id === current}
            badge={plan.id === current ? "Your plan" : plan.featured ? "Most popular" : undefined}
            action={
              plan.id === current ? (
                <Button variant="outline" className={cn("w-full", resting)} disabled>
                  Current plan
                </Button>
              ) : (
                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className={cn("w-full", !plan.featured && resting)}
                  disabled={!current}
                  onClick={() => setTarget(plan)}
                >
                  Switch to {plan.name}
                </Button>
              )
            }
          />
        ))}
      </div>

      <p className="text-foreground/70">
        Hotels, hospitals and large companies: custom contracts from {formatUsd(contractFromPerMinute)} a minute, billed
        by invoice.
      </p>

      <AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(undefined)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to {target?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {target && `${formatUsd(target.price)} a month with ${target.minutes} minutes included.`} Your
              receptionist keeps answering while the plan changes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={resting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirm} disabled={change.isPending}>
              {change.isPending && <Spinner data-icon="inline-start" />}
              Switch plan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
