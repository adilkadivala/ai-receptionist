import { formatUsd, type PlanId, plans } from "@receptionist/product";
import { Badge } from "@receptionist/ui/components/badge";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@receptionist/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@receptionist/ui/components/radio-group";
import { useId } from "react";

/** The self-serve plans as radio cards. */
export function PlanPicker({
  value,
  onChange,
  labelledBy,
}: {
  value: PlanId;
  onChange: (plan: PlanId) => void;
  labelledBy: string;
}) {
  const id = useId();

  return (
    <RadioGroup value={value} onValueChange={(plan) => onChange(plan as PlanId)} aria-labelledby={labelledBy}>
      {plans.map((plan) => (
        <FieldLabel key={plan.id} htmlFor={`${id}-${plan.id}`}>
          <Field orientation="horizontal">
            <RadioGroupItem id={`${id}-${plan.id}`} value={plan.id} />
            <FieldContent>
              <FieldTitle>
                {plan.name}
                {plan.featured && (
                  <Badge className="border-transparent bg-brand-soft text-brand-soft-foreground">Most popular</Badge>
                )}
              </FieldTitle>
              <FieldDescription>
                {plan.minutes} minutes a month. {plan.for}.
              </FieldDescription>
            </FieldContent>
            <p className="shrink-0 text-end font-medium tabular-nums">
              {formatUsd(plan.price)}
              <span className="font-normal text-muted-foreground">/mo</span>
            </p>
          </Field>
        </FieldLabel>
      ))}
    </RadioGroup>
  );
}
