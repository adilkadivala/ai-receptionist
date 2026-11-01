import { Button } from "@receptionist/ui/components/button";
import { FieldError } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { PhoneForwarded, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "../../../components/empty-state";
import { FormField } from "../../../components/form-field";
import { SettingsCard } from "../../../components/settings-card";
import { resting } from "../../../components/surfaces";
import { toE164 } from "../../../lib/validation";
import type { TransferNumber } from "../types";
import { limits } from "../validation";
import type { SectionProps } from "./section-props";

export function TransfersSection({ values, set, errors }: SectionProps) {
  const transfers = values.transfer_numbers;
  const update = (index: number, patch: Partial<TransferNumber>) =>
    set(
      "transfer_numbers",
      transfers.map((transfer, i) => (i === index ? { ...transfer, ...patch } : transfer)),
    );
  const add = () => set("transfer_numbers", [...transfers, { id: crypto.randomUUID(), label: "", e164: "", when: "" }]);
  const remove = (index: number) =>
    set(
      "transfer_numbers",
      transfers.filter((_, i) => i !== index),
    );

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={resting}
      onClick={add}
      disabled={transfers.length >= limits.transferNumbers}
    >
      <Plus data-icon="inline-start" />
      Add number
    </Button>
  );

  return (
    <SettingsCard
      title="Transfer numbers"
      description="Who the receptionist puts callers through to, and when. It tells the caller before it transfers."
      action={transfers.length > 0 && addButton}
    >
      {transfers.length === 0 ? (
        <EmptyState icon={PhoneForwarded} title="No transfer numbers" action={addButton} className="py-8">
          Without one, the receptionist takes a message instead of transferring, even for emergencies.
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-3">
          {transfers.map((transfer, index) => (
            <li key={transfer.id} className="grid gap-4 rounded-[14px] border p-4 sm:grid-cols-2">
              <FormField label="Who picks up" error={errors[`transfer_numbers.${index}.label`]}>
                {(control) => (
                  <Input
                    {...control}
                    value={transfer.label}
                    onChange={(event) => update(index, { label: event.target.value })}
                    placeholder="On-call plumber"
                  />
                )}
              </FormField>
              <FormField label="Phone number" error={errors[`transfer_numbers.${index}.e164`]}>
                {(control) => (
                  <Input
                    {...control}
                    type="tel"
                    inputMode="tel"
                    value={transfer.e164}
                    onChange={(event) => update(index, { e164: event.target.value })}
                    onBlur={(event) => event.target.value && update(index, { e164: toE164(event.target.value) })}
                    placeholder="+14155550123"
                    className="font-mono"
                  />
                )}
              </FormField>
              <FormField label="When to transfer" description="In your own words." className="sm:col-span-2">
                {(control) => (
                  <Input
                    {...control}
                    value={transfer.when}
                    onChange={(event) => update(index, { when: event.target.value })}
                    placeholder="Burst pipes, flooding, no hot water"
                  />
                )}
              </FormField>
              <div className="sm:col-span-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 data-icon="inline-start" />
                  Remove<span className="sr-only"> {transfer.label || `number ${index + 1}`}</span>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {errors.transfer_numbers && <FieldError className="mt-3">{errors.transfer_numbers}</FieldError>}
    </SettingsCard>
  );
}
