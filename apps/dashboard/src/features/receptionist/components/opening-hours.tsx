import { FieldError } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Switch } from "@receptionist/ui/components/switch";
import { useId } from "react";
import type { Errors } from "../../../lib/validation";
import { type DayHours, type Weekday, weekdays } from "../types";

const dayNames: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** One row per weekday: open or closed, and from when to when. */
export function OpeningHours({
  hours,
  onChange,
  errors,
}: {
  hours: Record<Weekday, DayHours>;
  onChange: (hours: Record<Weekday, DayHours>) => void;
  errors: Errors;
}) {
  const id = useId();
  const update = (day: Weekday, patch: Partial<DayHours>) => onChange({ ...hours, [day]: { ...hours[day], ...patch } });

  return (
    <ul className="flex flex-col divide-y rounded-lg border">
      {weekdays.map((day) => {
        const { open, from, to } = hours[day];
        const error = errors[`hours.${day}`];
        const errorId = `${id}-${day}-error`;
        return (
          <li key={day} className="flex flex-col gap-2 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <div className="flex w-36 items-center gap-2">
                <Switch id={`${id}-${day}`} checked={open} onCheckedChange={(on) => update(day, { open: on })} />
                <label htmlFor={`${id}-${day}`} className="text-sm font-medium">
                  {dayNames[day]}
                </label>
              </div>
              {open ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={from}
                    onChange={(event) => update(day, { from: event.target.value })}
                    aria-label={`${dayNames[day]} opening time`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="w-32"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    value={to}
                    onChange={(event) => update(day, { to: event.target.value })}
                    aria-label={`${dayNames[day]} closing time`}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? errorId : undefined}
                    className="w-32"
                  />
                </div>
              ) : (
                <span className="text-muted-foreground">Closed</span>
              )}
            </div>
            {error && <FieldError id={errorId}>{error}</FieldError>}
          </li>
        );
      })}
    </ul>
  );
}
