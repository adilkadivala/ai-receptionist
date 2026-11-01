import { Button } from "@receptionist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@receptionist/ui/components/dropdown-menu";
import { cn } from "@receptionist/ui/lib/utils";
import { Calendar } from "lucide-react";
import { dateRanges, rangeStart } from "../features/calls/filter";
import type { DateRange } from "../features/calls/types";
import { formatShortDate } from "../lib/format";
import { resting } from "./surfaces";

/** "Oct 3 – Nov 1" for a range ending today; nothing for "all". */
export function rangeSpan(range: DateRange, now = new Date()) {
  const start = rangeStart(range, now);
  if (!start || range === "today") return null;
  return `${formatShortDate(start)} – ${formatShortDate(now)}`;
}

/** Which days a page counts, as a menu in the site header. */
export function DateRangePicker({
  value,
  onValueChange,
  ranges = dateRanges.map((range) => range.value),
}: {
  value: DateRange;
  onValueChange: (range: DateRange) => void;
  ranges?: readonly DateRange[];
}) {
  const current = dateRanges.find((range) => range.value === value);
  const span = rangeSpan(value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Date range: ${current?.label}`}
            className={cn("tabular-nums", resting)}
          />
        }
      >
        <Calendar data-icon="inline-start" />
        <span className="hidden lg:inline">{span ?? current?.label}</span>
        <span className="lg:hidden">{current?.short}</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show calls from</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={(next) => onValueChange(next as DateRange)}>
            {dateRanges
              .filter((range) => ranges.includes(range.value))
              .map((range) => (
                <DropdownMenuRadioItem key={range.value} value={range.value}>
                  {range.label}
                </DropdownMenuRadioItem>
              ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
