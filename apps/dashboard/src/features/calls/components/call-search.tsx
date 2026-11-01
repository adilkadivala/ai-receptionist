import { Button } from "@receptionist/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@receptionist/ui/components/dialog";
import { Input } from "@receptionist/ui/components/input";
import { Spinner } from "@receptionist/ui/components/spinner";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowRight, Search } from "lucide-react";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { formatCallTime, formatPhone } from "../../../lib/format";
import { useCalls } from "../api";
import { defaultFilters, filtersToParams } from "../filter";
import { OutcomeBadge } from "./outcome-badge";

const shown = 6;
const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

/** Search every call from anywhere, with ⌘K or Ctrl+K. Shows the best matches; Enter opens the full results. */
export function CallSearch() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <Button variant="ghost" size="icon" aria-label="Search calls" className="md:hidden" onClick={() => setOpen(true)}>
        <Search />
      </Button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-56 items-center gap-2 rounded-lg border border-transparent bg-card px-2.5 text-sm text-muted-foreground shadow-(--raised) transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:flex lg:w-64 dark:border-input dark:bg-input/30"
      >
        <Search aria-hidden className="size-4" />
        <span className="flex-1 text-start">Search calls</span>
        <kbd className="rounded-md bg-hero px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          {isMac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="top-[15%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-lg"
          showCloseButton={false}
        >
          {open && <SearchPanel onDone={() => setOpen(false)} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

function SearchPanel({ onDone }: { onDone: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const hintId = useId();

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query.trim()), 150);
    return () => clearTimeout(timer);
  }, [query]);

  const filters = { ...defaultFilters, q: debounced };
  const calls = useCalls(filters, shown);
  const results = debounced ? calls.data?.items : undefined;
  const allResults = `/calls?${filtersToParams(filters)}`;

  function moveFocus(event: KeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    const links = Array.from(listRef.current?.querySelectorAll<HTMLElement>("a") ?? []);
    if (links.length === 0) return;
    event.preventDefault();
    const index = links.indexOf(document.activeElement as HTMLElement);
    const next = event.key === "ArrowDown" ? index + 1 : index - 1;
    links[(next + links.length) % links.length]?.focus();
  }

  return (
    <>
      <DialogTitle className="sr-only">Search calls</DialogTitle>
      <DialogDescription id={hintId} className="sr-only">
        Type a name, a phone number or what the call was about. Use the arrow keys to move through the results.
      </DialogDescription>
      <form
        className="flex items-center gap-2 border-b px-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) return;
          navigate(`/calls?${filtersToParams({ ...defaultFilters, q: query.trim() })}`);
          onDone();
        }}
      >
        <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />
        <Input
          type="search"
          aria-label="Search calls"
          aria-describedby={hintId}
          placeholder="Name, number or what they needed"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={moveFocus}
          className="h-12 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />
        {debounced && calls.isFetching && <Spinner className="text-muted-foreground" />}
      </form>
      <div className="max-h-[min(24rem,60svh)] overflow-y-auto p-2">
        {!debounced && (
          <p className="px-2 py-6 text-center text-muted-foreground">Search every call by caller or topic.</p>
        )}
        {results?.length === 0 && (
          <p className="px-2 py-6 text-center text-muted-foreground">No calls match “{debounced}”.</p>
        )}
        {results && results.length > 0 && (
          <ul ref={listRef} aria-label="Matching calls" className="flex flex-col gap-0.5">
            {results.map((call) => (
              <li key={call.id}>
                <Link
                  to={`/calls/${call.id}`}
                  onClick={onDone}
                  onKeyDown={moveFocus}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 outline-none hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">{call.caller_name ?? formatPhone(call.from_number)}</span>
                      <span className="shrink-0 text-xs text-muted-foreground">{formatCallTime(call.started_at)}</span>
                    </span>
                    <span className="truncate text-muted-foreground">{call.summary}</span>
                  </span>
                  <OutcomeBadge outcome={call.outcome} className="hidden sm:inline-flex" />
                </Link>
              </li>
            ))}
            {calls.data && calls.data.total > shown && (
              <li>
                <Link
                  to={allResults}
                  onClick={onDone}
                  onKeyDown={moveFocus}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2 py-2 font-medium text-primary outline-none",
                    "hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                >
                  See all {calls.data.total} matching calls
                  <ArrowRight aria-hidden className="size-4 rtl:rotate-180" />
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>
    </>
  );
}
