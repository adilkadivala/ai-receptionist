import { allLanguages, type Language, languageCount, languages } from "@receptionist/product";
import { Button } from "@receptionist/ui/components/button";
import { Checkbox } from "@receptionist/ui/components/checkbox";
import { Input } from "@receptionist/ui/components/input";
import { Search } from "lucide-react";
import { useId, useState } from "react";

/** Every launch language as checkboxes, grouped by region, with a filter. */
export function LanguagePicker({
  value,
  onChange,
  invalid,
  labelledBy,
  describedBy,
}: {
  value: readonly Language[];
  onChange: (value: Language[]) => void;
  invalid?: boolean;
  labelledBy?: string;
  describedBy?: string;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const selected = new Set(value);
  const needle = query.trim().toLowerCase();
  const groups = Object.entries(languages)
    .map(([region, list]) => [region, list.filter((language) => language.toLowerCase().includes(needle))] as const)
    .filter(([, list]) => list.length > 0);

  // Keep the README's order, whatever order they were ticked in.
  const update = (next: Set<Language>) => onChange(allLanguages.filter((language) => next.has(language)));

  function toggle(language: Language, on: boolean) {
    const next = new Set(selected);
    if (on) next.add(language);
    else next.delete(language);
    update(next);
  }

  function toggleAll(list: readonly Language[], on: boolean) {
    const next = new Set(selected);
    for (const language of list) {
      if (on) next.add(language);
      else next.delete(language);
    }
    update(next);
  }

  return (
    <fieldset aria-labelledby={labelledBy} aria-describedby={describedBy} className="flex min-w-0 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="font-medium tabular-nums">
          {value.length} of {languageCount} selected
        </p>
        <div className="relative w-full sm:w-60">
          <label htmlFor={`${id}-filter`} className="sr-only">
            Filter languages
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id={`${id}-filter`}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter languages"
            className="ps-8"
          />
        </div>
      </div>

      {groups.length === 0 && <p className="text-muted-foreground">No language matches “{query}”.</p>}

      {groups.map(([region, list]) => {
        const allOn = list.every((language) => selected.has(language));
        const headingId = `${id}-${region.replaceAll(" ", "-")}`;
        return (
          <div key={region} className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h4 id={headingId} className="font-medium">
                {region}
              </h4>
              <Button type="button" variant="link" size="sm" onClick={() => toggleAll(list, !allOn)}>
                {allOn ? "Clear" : "Select all"}
                <span className="sr-only"> in {region}</span>
              </Button>
            </div>
            <fieldset
              aria-labelledby={headingId}
              className="grid min-w-0 grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4"
            >
              {list.map((language) => {
                const checkboxId = `${id}-${language}`;
                return (
                  <div key={language} className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted">
                    <Checkbox
                      id={checkboxId}
                      checked={selected.has(language)}
                      onCheckedChange={(on) => toggle(language, on)}
                      aria-invalid={invalid || undefined}
                    />
                    <label htmlFor={checkboxId} className="flex-1 cursor-pointer text-sm">
                      {language}
                    </label>
                  </div>
                );
              })}
            </fieldset>
          </div>
        );
      })}
    </fieldset>
  );
}
