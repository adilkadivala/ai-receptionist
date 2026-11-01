import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const list = typeof window.matchMedia === "function" ? window.matchMedia(query) : null;
  list?.addEventListener("change", onChange);
  return () => list?.removeEventListener("change", onChange);
}

/** True when the person asked their system for less motion. */
export function useReducedMotion() {
  return useSyncExternalStore(
    subscribe,
    () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
    () => true,
  );
}
