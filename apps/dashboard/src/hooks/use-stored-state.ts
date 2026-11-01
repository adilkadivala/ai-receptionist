import { useCallback, useState } from "react";

/**
 * useState that remembers its value in localStorage, for per-browser conveniences such as hidden table columns.
 * Storage can be missing or blocked, so every read and write falls back to plain state.
 */
export function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initial : (JSON.parse(stored) as T);
    } catch {
      return initial;
    }
  });

  const store = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Keep the value for this visit only.
      }
    },
    [key],
  );

  return [value, store] as const;
}
