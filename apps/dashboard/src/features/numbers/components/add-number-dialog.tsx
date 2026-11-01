import { addOns, formatUsd } from "@receptionist/product";
import { Alert, AlertDescription } from "@receptionist/ui/components/alert";
import { Button } from "@receptionist/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@receptionist/ui/components/dialog";
import { FieldGroup } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@receptionist/ui/components/select";
import { Spinner } from "@receptionist/ui/components/spinner";
import { Info, Plus } from "lucide-react";
import { useState } from "react";
import { FormField } from "../../../components/form-field";
import { resting } from "../../../components/surfaces";
import { useValidatedForm } from "../../../hooks/use-validated-form";
import type { Agent } from "../../receptionist/types";
import { useAddNumber, useNumberCountries } from "../api";
import type { AddNumberInput, PhoneNumber } from "../types";
import { validateAddNumber } from "../validation";
import { AgentSelect } from "./agent-select";

const extraNumber = addOns.find((addOn) => addOn.id === "extra-number");

/** Buys a new number and chooses who answers it. */
export function AddNumberDialog({
  agents,
  onAdded,
}: {
  agents: readonly Agent[];
  onAdded: (number: PhoneNumber) => void;
}) {
  const [open, setOpen] = useState(false);
  const countries = useNumberCountries();
  const add = useAddNumber();
  const initial: AddNumberInput = { country: "US", area_code: "", agent_id: agents[0]?.id ?? null, label: "" };
  const form = useValidatedForm(initial, validateAddNumber);
  const country = countries.data?.find((candidate) => candidate.code === form.values.country);
  const countryItems = countries.data?.map((candidate) => ({ value: candidate.code, label: candidate.name })) ?? [];

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      form.reset(initial);
      add.reset();
    }
  }

  const onSubmit = form.handleSubmit((values) =>
    add.mutate(values, {
      onSuccess: (number) => {
        onOpenChange(false);
        onAdded(number);
      },
    }),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger render={<Button />}>
        <Plus data-icon="inline-start" />
        Add number
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form ref={form.formRef} onSubmit={onSubmit} noValidate className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Add a phone number</DialogTitle>
            <DialogDescription>
              A new local number, answered by your receptionist straight away.
              {extraNumber && ` It adds ${formatUsd(extraNumber.price)} a month to your bill.`}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <FormField label="Country" error={form.errors.country}>
              {(control) => (
                <Select
                  items={countryItems}
                  value={form.values.country}
                  onValueChange={(code) => code && form.set("country", code)}
                >
                  <SelectTrigger {...control} className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countryItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>

            {country?.requirement && (
              <Alert>
                <Info />
                <AlertDescription>{country.requirement}</AlertDescription>
              </Alert>
            )}

            <FormField
              label="Area code"
              error={form.errors.area_code}
              description="Optional. We'll pick the closest one available."
            >
              {(control) => (
                <Input
                  {...control}
                  inputMode="numeric"
                  value={form.values.area_code}
                  onChange={(event) => form.set("area_code", event.target.value.trim())}
                  placeholder={country?.dial_code === "+1" ? "415" : undefined}
                  className="w-32"
                />
              )}
            </FormField>

            <FormField label="Name" error={form.errors.label} description="Optional, e.g. “Second location”.">
              {(control) => (
                <Input
                  {...control}
                  value={form.values.label}
                  onChange={(event) => form.set("label", event.target.value)}
                />
              )}
            </FormField>

            <FormField label="Answered by">
              {(control) => (
                <AgentSelect
                  {...control}
                  agents={agents}
                  value={form.values.agent_id}
                  onValueChange={(agentId) => form.set("agent_id", agentId)}
                  className="w-full"
                />
              )}
            </FormField>
          </FieldGroup>

          {add.isError && (
            <Alert variant="destructive">
              <AlertDescription>Couldn't add the number. You haven't been charged. Try again.</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" className={resting} />}>Cancel</DialogClose>
            <Button type="submit" disabled={add.isPending}>
              {add.isPending && <Spinner data-icon="inline-start" />}
              Add number
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
