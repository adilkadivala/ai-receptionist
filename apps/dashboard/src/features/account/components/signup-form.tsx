import { findPlan, type PlanId, plans } from "@receptionist/product";
import { Button } from "@receptionist/ui/components/button";
import { FieldGroup, FieldLegend, FieldSet } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@receptionist/ui/components/select";
import { Spinner } from "@receptionist/ui/components/spinner";
import { useId } from "react";
import { useSearchParams } from "react-router";
import { FormField } from "../../../components/form-field";
import { useValidatedForm } from "../../../hooks/use-validated-form";
import { useSignup } from "../api";
import { regions } from "../regions";
import type { Region, SignupInput } from "../types";
import { minPasswordLength, validateSignup } from "../validation";
import { PlanPicker } from "./plan-picker";
import { SubmitError } from "./submit-error";

const regionItems = regions.map((region) => ({ value: region.id, label: region.label }));

/** Plan, account and business details. The plan starts from ?plan=, as linked from the landing page. */
export function SignupForm() {
  const id = useId();
  const [params, setParams] = useSearchParams();
  const signup = useSignup();
  const form = useValidatedForm<SignupInput>(
    {
      plan: findPlan(params.get("plan"))?.id ?? (plans[0]?.id as PlanId),
      name: "",
      business_name: "",
      email: "",
      password: "",
      region: "us",
    },
    validateSignup,
  );

  function choosePlan(plan: PlanId) {
    form.set("plan", plan);
    // Keep the link in step, so a reload or a shared link shows the same plan.
    setParams({ plan }, { replace: true });
  }

  return (
    <form
      ref={form.formRef}
      noValidate
      onSubmit={form.handleSubmit((values) => signup.mutate(values))}
      className="flex flex-col gap-6"
    >
      <FieldSet>
        <FieldLegend id={`${id}-plan`}>Plan</FieldLegend>
        <PlanPicker value={form.values.plan} onChange={choosePlan} labelledBy={`${id}-plan`} />
      </FieldSet>

      <FieldSet>
        <FieldLegend>Your details</FieldLegend>
        <FieldGroup className="gap-4">
          <FormField label="Your name" error={form.errors.name}>
            {(control) => (
              <Input
                {...control}
                autoComplete="name"
                value={form.values.name}
                onChange={(event) => form.set("name", event.target.value)}
              />
            )}
          </FormField>
          <FormField label="Business name" error={form.errors.business_name}>
            {(control) => (
              <Input
                {...control}
                autoComplete="organization"
                value={form.values.business_name}
                onChange={(event) => form.set("business_name", event.target.value)}
              />
            )}
          </FormField>
          <FormField label="Work email" error={form.errors.email}>
            {(control) => (
              <Input
                {...control}
                type="email"
                autoComplete="email"
                value={form.values.email}
                onChange={(event) => form.set("email", event.target.value)}
              />
            )}
          </FormField>
          <FormField
            label="Password"
            error={form.errors.password}
            description={`At least ${minPasswordLength} characters.`}
          >
            {(control) => (
              <Input
                {...control}
                type="password"
                autoComplete="new-password"
                value={form.values.password}
                onChange={(event) => form.set("password", event.target.value)}
              />
            )}
          </FormField>
          <FormField
            label="Where to keep your data"
            description="Where your calls and transcripts are stored. It's chosen once and can't be moved later."
          >
            {(control) => (
              <Select
                items={regionItems}
                value={form.values.region}
                onValueChange={(region) => region && form.set("region", region as Region)}
              >
                <SelectTrigger {...control} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {regionItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
        </FieldGroup>
      </FieldSet>

      {signup.error && <SubmitError error={signup.error} />}

      <Button type="submit" size="lg" disabled={signup.isPending}>
        {signup.isPending && <Spinner data-icon="inline-start" />}
        Create account
      </Button>
    </form>
  );
}
