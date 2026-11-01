// Light, dark or follow the system. The choice is a per-browser convenience in localStorage; index.html applies it
// before the first paint so a dark page never flashes white.
import { useSyncExternalStore } from "react";

export type ThemeChoice = "light" | "dark" | "system";

export const themeChoices: readonly { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Same as this device" },
];

const storageKey = "theme";
const listeners = new Set<() => void>();
const darkQuery = () =>
  typeof window.matchMedia === "function" ? window.matchMedia("(prefers-color-scheme: dark)") : null;

function readChoice(): ThemeChoice {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function isDark(choice: ThemeChoice) {
  return choice === "dark" || (choice === "system" && Boolean(darkQuery()?.matches));
}

function apply() {
  const dark = isDark(readChoice());
  document.documentElement.classList.toggle("dark", dark);
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
  for (const listener of listeners) listener();
}

export function setTheme(choice: ThemeChoice) {
  try {
    if (choice === "system") localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, choice);
  } catch {
    // Storage can be blocked; the choice still applies until the page reloads.
  }
  apply();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const query = darkQuery();
  query?.addEventListener("change", apply);
  return () => {
    listeners.delete(listener);
    query?.removeEventListener("change", apply);
  };
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readChoice, () => "system" as const);
  const resolvedTheme = useSyncExternalStore(
    subscribe,
    (): "dark" | "light" => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light" as const,
  );
  return { theme, resolvedTheme, setTheme };
}
