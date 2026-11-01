import { languageCount } from "@receptionist/product";
import { FieldError } from "@receptionist/ui/components/field";
import { useId } from "react";
import { SettingsCard } from "../../../components/settings-card";
import { LanguagePicker } from "./language-picker";
import type { SectionProps } from "./section-props";

export function LanguagesSection({ values, set, errors }: SectionProps) {
  const id = useId();

  return (
    <SettingsCard
      title="Languages"
      titleId={`${id}-title`}
      description={`The languages your callers usually speak. The receptionist still answers anyone in all ${languageCount} languages, in whatever language they use.`}
    >
      <div className="flex flex-col gap-3">
        <LanguagePicker
          value={values.languages}
          onChange={(languages) => set("languages", languages)}
          invalid={Boolean(errors.languages)}
          labelledBy={`${id}-title`}
          describedBy={errors.languages ? `${id}-error` : undefined}
        />
        {errors.languages && <FieldError id={`${id}-error`}>{errors.languages}</FieldError>}
      </div>
    </SettingsCard>
  );
}
