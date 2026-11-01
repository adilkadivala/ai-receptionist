import { Pattern } from "@receptionist/ui/blocks/drafting";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@receptionist/ui/components/field";
import { Switch } from "@receptionist/ui/components/switch";
import { Textarea } from "@receptionist/ui/components/textarea";
import { Volume2 } from "lucide-react";
import { useId } from "react";
import { FormField } from "../../../components/form-field";
import { SettingsCard } from "../../../components/settings-card";
import { aiNotice } from "../greeting";
import { limits } from "../validation";
import type { SectionProps } from "./section-props";

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

        {/* The greeting stands on a patterned stage as a speech bubble, like the landing page's call demo. */}
        <figure className="relative flex flex-col gap-3 overflow-hidden rounded-[14px] bg-hero p-5">
          <Pattern kind="chevron" />
          <figcaption className="relative flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Volume2 aria-hidden className="size-3.5" />
            What callers hear
          </figcaption>
          <blockquote
            dir="auto"
            className="relative max-w-[60ch] rounded-[14px] rounded-es-[4px] bg-card px-4 py-3 text-pretty shadow-(--raised)"
          >
            {values.greeting.trim() || "…"}{" "}
            <span className="text-muted-foreground">{aiNotice(values.recording_notice)}</span>
          </blockquote>
        </figure>
      </FieldGroup>
    </SettingsCard>
  );
}
