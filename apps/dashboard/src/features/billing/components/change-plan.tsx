import { contractFromPerMinute, formatUsd, included, overagePerMinute, type Plan, plans } from "@receptionist/product";
import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
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
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { useChangePlan, useSubscription } from "../api";

/** Every self-serve plan, with a confirmation before switching. */
export function ChangePlan() {
  const subscription = useSubscription();
  const change = useChangePlan();
  const [target, setTarget] = useState<Plan>();
  const [changedTo, setChangedTo] = useState<Plan>();
  const current = subscription.data?.plan;

  function confirm() {
    if (!target) return;
    change.mutate(target.id, {
      onSuccess: () => {
        setChangedTo(target);
        setTarget(undefined);
      },
    });
  }

  return (
    <section id="change-plan" aria-labelledby="change-plan-title" className="flex scroll-mt-20 flex-col gap-4">
      <div>
        <h2 id="change-plan-title" className="font-heading text-lg font-semibold">
          Change plan
        </h2>
        <p className="text-muted-foreground">
          Every plan includes {included.join(", ").toLowerCase()}. Extra minutes are {formatUsd(overagePerMinute)} each.
        </p>
      </div>

      {changedTo && (
        <Alert>
          <CircleCheck />
          <AlertTitle>You're on {changedTo.name}</AlertTitle>
          <AlertDescription>
            {changedTo.minutes} minutes a month from now on. This is sample data: real plan changes arrive with
            payments.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            highlighted={plan.id === current}
            badge={plan.id === current ? "Your plan" : plan.featured ? "Most popular" : undefined}
            action={
              plan.id === current ? (
                <Button variant="outline" className="w-full" disabled>
                  Current plan
                </Button>
              ) : (
                <Button
                  variant={plan.featured ? "default" : "outline"}
                  className="w-full"
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

      <p className="text-muted-foreground">
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
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
