import { Button } from "@receptionist/ui/components/button";
import { Input } from "@receptionist/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@receptionist/ui/components/select";
import { Search, X } from "lucide-react";
import { type ReactNode, useId } from "react";

/** Search box, filters and a reset button above a table. */
export function TableToolbar({
  search,
  onSearchChange,
  searchLabel,
  searchPlaceholder = searchLabel,
  children,
  onReset,
  canReset,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  /** Shorter text for narrow screens; the label stays for screen readers. */
  searchPlaceholder?: string;
  /** Filters, usually FilterSelects. */
  children?: ReactNode;
  onReset: () => void;
  canReset: boolean;
}) {
  const id = useId();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-72">
        <label htmlFor={id} className="sr-only">
          {searchLabel}
        </label>
        <Search
          aria-hidden
          className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          id={id}
          type="search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="ps-8"
        />
      </div>
      {children}
      {canReset && (
        <Button variant="ghost" onClick={onReset}>
          <X data-icon="inline-start" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

export type FilterOption = { value: string; label: string };

/** A labelled single-choice filter. The empty string means "all". */
export function FilterSelect({
  label,
  value,
  onValueChange,
  options,
  allLabel,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly FilterOption[];
  allLabel: string;
}) {
  const items = [{ value: "", label: allLabel }, ...options];

  return (
    <Select items={items} value={value} onValueChange={(next) => onValueChange(next ?? "")}>
      <SelectTrigger aria-label={label} className="min-w-36 flex-1 sm:flex-none">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
