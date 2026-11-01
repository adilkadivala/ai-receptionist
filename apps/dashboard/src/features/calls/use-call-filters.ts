import { useCallback } from "react";
import { useSearchParams } from "react-router";
import { defaultFilters, filtersFromParams, filtersToParams } from "./filter";
import type { CallFilters } from "./types";

/**
 * The call filters in the URL, and a function to change them. Any change other than the page starts again from page 1.
 * `defaults` must be a constant: the Overview opens on the last 30 days, the Calls page on all time.
 */
export function useCallFilters(defaults: CallFilters = defaultFilters) {
  const [params, setParams] = useSearchParams();
  const filters = filtersFromParams(params, defaults);

  const update = useCallback(
    (patch: Partial<CallFilters>) => {
      const next = { ...filtersFromParams(params, defaults), page: 1, ...patch };
      setParams(filtersToParams(next, defaults), { replace: !("page" in patch) });
    },
    [params, setParams, defaults],
  );

  return [filters, update] as const;
}
