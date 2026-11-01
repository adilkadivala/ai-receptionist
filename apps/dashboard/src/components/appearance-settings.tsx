import { Field, FieldLabel } from "@receptionist/ui/components/field";
import { RadioGroup, RadioGroupItem } from "@receptionist/ui/components/radio-group";
import { useId } from "react";
import { type ThemeChoice, themeChoices, useTheme } from "../lib/theme";
import { SettingsCard } from "./settings-card";

/** Light, dark or the device's setting. Applies at once and is remembered in this browser. */
export function AppearanceSettings() {
  const id = useId();
  const { theme, setTheme } = useTheme();

  return (
    <SettingsCard
      title="Appearance"
      titleId={`${id}-title`}
      description="Remembered on this browser only, so each device can have its own."
    >
      <RadioGroup
        value={theme}
        onValueChange={(next) => setTheme(next as ThemeChoice)}
        aria-labelledby={`${id}-title`}
        className="grid gap-3 sm:grid-cols-3"
      >
        {themeChoices.map((choice) => (
          <FieldLabel key={choice.value} htmlFor={`${id}-${choice.value}`}>
            <Field orientation="horizontal" className="items-center">
              <RadioGroupItem id={`${id}-${choice.value}`} value={choice.value} />
              <span className="font-medium">{choice.label}</span>
            </Field>
          </FieldLabel>
        ))}
      </RadioGroup>
    </SettingsCard>
  );
}
