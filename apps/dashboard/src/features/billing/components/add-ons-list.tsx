import { addOns, formatUsd } from "@receptionist/product";
import { Card, CardContent } from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { Switch } from "@receptionist/ui/components/switch";
import { useId } from "react";
import { useSubscription, useToggleAddOn } from "../api";

/** Paid extras on top of the plan. */
export function AddOnsList() {
  const id = useId();
  const subscription = useSubscription();
  const toggle = useToggleAddOn();
  const active = new Set(subscription.data?.add_ons);

  return (
    <section id="add-ons" aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-4">
      <div>
        <h2 id={`${id}-title`} className="font-heading text-lg font-semibold">
          Add-ons
        </h2>
        <p className="text-muted-foreground">Billed monthly with your plan. Turn them off any time.</p>
      </div>
      <Card>
        <CardContent>
          <ul className="flex flex-col divide-y">
            {addOns.map((addOn) => (
              <li key={addOn.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <label htmlFor={`${id}-${addOn.id}`} className="font-medium">
                    {addOn.name}
                  </label>
                  <p className="text-muted-foreground">{addOn.description}</p>
                </div>
                <p className="shrink-0 text-end tabular-nums">
                  {addOn.from && <span className="text-muted-foreground">from </span>}
                  {formatUsd(addOn.price)}
                  <span className="text-muted-foreground">/mo</span>
                </p>
                {subscription.isPending ? (
                  <Skeleton className="h-5 w-8" />
                ) : (
                  <Switch
                    id={`${id}-${addOn.id}`}
                    checked={active.has(addOn.id)}
                    disabled={toggle.isPending && toggle.variables?.id === addOn.id}
                    onCheckedChange={(on) => toggle.mutate({ id: addOn.id, on })}
                  />
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  );
}
