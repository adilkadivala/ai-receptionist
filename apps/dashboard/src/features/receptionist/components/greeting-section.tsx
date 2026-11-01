import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@receptionist/ui/components/field";
import { Switch } from "@receptionist/ui/components/switch";
import { Textarea } from "@receptionist/ui/components/textarea";
import { Volume2 } from "lucide-react";
import { useId } from "react";
import { FormField } from "../../../components/form-field";
import { aiNotice } from "../greeting";
import { limits } from "../validation";
import { type SectionProps, SettingsCard } from "./settings-card";

export function GreetingSection({ values, set, errors }: SectionProps) {
  const switchId = useId();

  return (
    <SettingsCard
      title="Greeting and AI notice"
      description="The first thing every caller hears. The AI notice follows it on every call."
    >
      <FieldGroup>
        <FormField
          label="Greeting"
          error={errors.greeting}
          description={`${values.greeting.length} of ${limits.greeting} characters. Short greetings let callers get to the point.`}
        >
          {(control) => (
            <Textarea
              {...control}
              rows={3}
              value={values.greeting}
              onChange={(event) => set("greeting", event.target.value)}
            />
          )}
        </FormField>

        <Field orientation="horizontal">
          <Switch
            id={switchId}
            checked={values.recording_notice}
            onCheckedChange={(on) => set("recording_notice", on)}
          />
          <FieldContent>
            <FieldLabel htmlFor={switchId}>Say that the call may be recorded</FieldLabel>
            <FieldDescription>
              Turn this off only if calls aren't recorded, for example in HIPAA mode. The AI notice itself always plays.
            </FieldDescription>
          </FieldContent>
        </Field>

        <figure className="flex flex-col gap-2 rounded-lg bg-muted p-4">
          <figcaption className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Volume2 aria-hidden className="size-3.5" />
            What callers hear
          </figcaption>
          <blockquote dir="auto" className="text-pretty">
            {values.greeting.trim() || "…"}{" "}
            <span className="text-muted-foreground">{aiNotice(values.recording_notice)}</span>
          </blockquote>
        </figure>
      </FieldGroup>
    </SettingsCard>
  );
}
