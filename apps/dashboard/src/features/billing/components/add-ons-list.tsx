import { addOns, formatUsd } from "@receptionist/product";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { Switch } from "@receptionist/ui/components/switch";
import { cn } from "@receptionist/ui/lib/utils";
import { useId } from "react";
import { toast } from "sonner";
import { SectionTitle } from "../../../components/section-title";
import { raised } from "../../../components/surfaces";
import { useSubscription, useToggleAddOn } from "../api";

/** Paid extras on top of the plan. */
export function AddOnsList() {
  const id = useId();
  const subscription = useSubscription();
  const toggle = useToggleAddOn();
  const active = new Set(subscription.data?.add_ons);

  return (
    <section id="add-ons" aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-4">
      <SectionTitle
        id={`${id}-title`}
        title="Add-ons"
        description="Billed monthly with your plan. Turn them off any time."
      />
      <div className={cn(raised, "px-5 py-4")}>
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
                  onCheckedChange={(on) =>
                    toggle.mutate(
                      { id: addOn.id, on },
                      {
                        onSuccess: () =>
                          toast.success(on ? `${addOn.name} is on` : `${addOn.name} is off`, {
                            description: "Sample data: billing changes arrive with payments.",
                          }),
                        onError: () => toast.error(`Couldn't change ${addOn.name}. Nothing was charged.`),
                      },
                    )
                  }
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
