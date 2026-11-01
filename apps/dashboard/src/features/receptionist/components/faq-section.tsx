import { Button } from "@receptionist/ui/components/button";
import { FieldError } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Textarea } from "@receptionist/ui/components/textarea";
import { MessageCircleQuestion, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "../../../components/empty-state";
import { FormField } from "../../../components/form-field";
import { SettingsCard } from "../../../components/settings-card";
import { resting } from "../../../components/surfaces";
import type { FaqEntry } from "../types";
import { limits } from "../validation";
import type { SectionProps } from "./section-props";

export function FaqSection({ values, set, errors }: SectionProps) {
  const faqs = values.faqs;
  const update = (index: number, patch: Partial<FaqEntry>) =>
    set(
      "faqs",
      faqs.map((faq, i) => (i === index ? { ...faq, ...patch } : faq)),
    );
  const add = () => set("faqs", [...faqs, { id: crypto.randomUUID(), question: "", answer: "" }]);
  const remove = (index: number) =>
    set(
      "faqs",
      faqs.filter((_, i) => i !== index),
    );

  const addButton = (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={resting}
      onClick={add}
      disabled={faqs.length >= limits.faqs}
    >
      <Plus data-icon="inline-start" />
      Add question
    </Button>
  );

  return (
    <SettingsCard
      title="Frequently asked questions"
      description="Answers the receptionist gives as you wrote them, translated into the caller's language."
      action={faqs.length > 0 && addButton}
    >
      {faqs.length === 0 ? (
        <EmptyState icon={MessageCircleQuestion} title="No questions yet" action={addButton} className="py-8">
          Add the questions callers ask most, like prices, areas you cover or parking.
        </EmptyState>
      ) : (
        <ol className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <li key={faq.id} className="flex flex-col gap-4 rounded-[14px] border p-4">
              <FormField label="Question" error={errors[`faqs.${index}.question`]}>
                {(control) => (
                  <Input
                    {...control}
                    value={faq.question}
                    onChange={(event) => update(index, { question: event.target.value })}
                  />
                )}
              </FormField>
              <FormField label="Answer" error={errors[`faqs.${index}.answer`]}>
                {(control) => (
                  <Textarea
                    {...control}
                    rows={2}
                    value={faq.answer}
                    onChange={(event) => update(index, { answer: event.target.value })}
                  />
                )}
              </FormField>
              <div>
                <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
                  <Trash2 data-icon="inline-start" />
                  Remove<span className="sr-only"> question {index + 1}</span>
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}
      {errors.faqs && <FieldError className="mt-3">{errors.faqs}</FieldError>}
    </SettingsCard>
  );
}
