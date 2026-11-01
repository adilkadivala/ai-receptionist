import { FieldDescription, FieldGroup, FieldLegend, FieldSet } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@receptionist/ui/components/select";
import { Textarea } from "@receptionist/ui/components/textarea";
import { FormField } from "../../../components/form-field";
import { limits } from "../validation";
import { OpeningHours } from "./opening-hours";
import { type SectionProps, SettingsCard } from "./settings-card";

const timeZones = Intl.supportedValuesOf("timeZone").map((zone) => ({ value: zone, label: zone.replaceAll("_", " ") }));

export function BusinessSection({ values, set, errors }: SectionProps) {
  return (
    <SettingsCard
      title="Business info and hours"
      description="What the receptionist knows about you, and when you're open."
    >
      <FieldGroup>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Business name" error={errors.business_name}>
            {(control) => (
              <Input
                {...control}
                value={values.business_name}
                onChange={(event) => set("business_name", event.target.value)}
                autoComplete="organization"
              />
            )}
          </FormField>
          <FormField label="Address" description="Optional. Given to callers who ask for directions.">
            {(control) => (
              <Input
                {...control}
                value={values.address}
                onChange={(event) => set("address", event.target.value)}
                autoComplete="street-address"
              />
            )}
          </FormField>
        </div>

        <FormField
          label="About your business"
          error={errors.business_info}
          description={`What you do, where you work and your usual prices. ${values.business_info.length} of ${limits.businessInfo} characters.`}
        >
          {(control) => (
            <Textarea
              {...control}
              rows={5}
              value={values.business_info}
              onChange={(event) => set("business_info", event.target.value)}
            />
          )}
        </FormField>

        <FormField label="Time zone" error={errors.time_zone} className="md:max-w-sm">
          {(control) => (
            <Select items={timeZones} value={values.time_zone} onValueChange={(zone) => zone && set("time_zone", zone)}>
              <SelectTrigger {...control} className="w-full">
                <SelectValue placeholder="Choose a time zone" />
              </SelectTrigger>
              <SelectContent>
                {timeZones.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>

        <FieldSet>
          <FieldLegend>Opening hours</FieldLegend>
          <FieldDescription>
            Outside these hours the receptionist still answers: it takes messages and transfers emergencies.
          </FieldDescription>
          <OpeningHours hours={values.hours} onChange={(hours) => set("hours", hours)} errors={errors} />
        </FieldSet>
      </FieldGroup>
    </SettingsCard>
  );
}
