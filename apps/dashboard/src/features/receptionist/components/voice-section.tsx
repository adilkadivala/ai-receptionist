import { addOns, formatUsd } from "@receptionist/product";
import { buttonVariants } from "@receptionist/ui/components/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldTitle,
} from "@receptionist/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@receptionist/ui/components/radio-group";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { Mic } from "lucide-react";
import { useId } from "react";
import { Link } from "react-router";
import { SettingsCard } from "../../../components/settings-card";
import { useVoices } from "../api";
import type { SectionProps } from "./section-props";

const voiceClone = addOns.find((addOn) => addOn.id === "voice-clone");

export function VoiceSection({ values, set, errors }: SectionProps) {
  const id = useId();
  const voices = useVoices();

  return (
    <SettingsCard title="Voice" titleId={`${id}-title`} description="How the receptionist sounds in every language.">
      <div className="flex flex-col gap-4">
        {voices.isPending ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {["a", "b", "c", "d"].map((key) => (
              <Skeleton key={key} className="h-16" />
            ))}
          </div>
        ) : (
          <RadioGroup
            value={values.voice_id}
            onValueChange={(voice) => set("voice_id", voice as string)}
            aria-labelledby={`${id}-title`}
            className="grid gap-3 sm:grid-cols-2"
          >
            {voices.data?.map((voice) => (
              <FieldLabel key={voice.id} htmlFor={`${id}-${voice.id}`}>
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{voice.name}</FieldTitle>
                    <FieldDescription>{voice.description}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem
                    id={`${id}-${voice.id}`}
                    value={voice.id}
                    aria-invalid={errors.voice_id ? true : undefined}
                  />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
        )}
        {errors.voice_id && <FieldError>{errors.voice_id}</FieldError>}

        {voiceClone && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed p-4">
            <Mic aria-hidden className="size-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">
                {voiceClone.name}, {formatUsd(voiceClone.price)} a month
              </p>
              <p className="text-muted-foreground">{voiceClone.description}</p>
            </div>
            <Link to="/billing#add-ons" className={buttonVariants({ variant: "outline", size: "sm" })}>
              See add-ons
            </Link>
          </div>
        )}
      </div>
    </SettingsCard>
  );
}
