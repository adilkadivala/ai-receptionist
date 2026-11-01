import { allLanguages, type Language } from "@receptionist/product";
import { Button } from "@receptionist/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@receptionist/ui/components/dropdown-menu";
import { Input } from "@receptionist/ui/components/input";
import { Columns3, Plus, Search, X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { type OptionalColumn, optionalColumns } from "../columns";

/** Search that waits for a pause in typing before it asks for results, and follows the URL when it changes. */
export function CallSearchField({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const id = useId();
  const [search, setSearch] = useState(value);

  // Follow the URL when it changes from outside, e.g. the back button, ⌘K search or "Clear filters".
  useEffect(() => setSearch(value), [value]);

  useEffect(() => {
    if (search === value) return;
    const timer = setTimeout(() => onChange(search), 250);
    return () => clearTimeout(timer);
  }, [search, value, onChange]);

  return (
    <div className="relative w-full sm:w-60">
      <label htmlFor={id} className="sr-only">
        Search by number, name or summary
      </label>
      <Search
        aria-hidden
        className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        id={id}
        type="search"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search calls"
        className="ps-8"
      />
    </div>
  );
}

/** A dashed "+ Language" chip that becomes "Language: Spanish ×" once chosen. */
export function LanguageFilter({
  value,
  onChange,
}: {
  value: Language | "";
  onChange: (language: Language | "") => void;
}) {
  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className={
                value
                  ? "rounded-e-none border-e-0"
                  : "border-dashed text-foreground/80 dark:border-input dark:bg-transparent"
              }
            />
          }
        >
          {value ? (
            <>
              <span className="text-muted-foreground">Language:</span>
              {value}
            </>
          ) : (
            <>
              <Plus data-icon="inline-start" />
              Language
            </>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 min-w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Language the caller spoke</DropdownMenuLabel>
            <DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as Language)}>
              {allLanguages.map((language) => (
                <DropdownMenuRadioItem key={language} value={language}>
                  {language}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {value && (
        <Button
          variant="outline"
          size="icon"
          aria-label={`Stop filtering by ${value}`}
          className="rounded-s-none"
          onClick={() => onChange("")}
        >
          <X />
        </Button>
      )}
    </div>
  );
}

/** Which optional columns the call table shows. */
export function ColumnsMenu({
  hidden,
  onHiddenChange,
}: {
  hidden: readonly OptionalColumn[];
  onHiddenChange: (hidden: OptionalColumn[]) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="outline" className="text-foreground/80" />}>
        <Columns3 data-icon="inline-start" />
        Columns
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Show columns</DropdownMenuLabel>
          {optionalColumns.map((column) => (
            <DropdownMenuCheckboxItem
              key={column.id}
              checked={!hidden.includes(column.id)}
              onCheckedChange={(checked) =>
                onHiddenChange(checked ? hidden.filter((id) => id !== column.id) : [...hidden, column.id])
              }
            >
              {column.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
