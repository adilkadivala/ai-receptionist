// Display helpers. Dates use the browser's locale; money uses formatUsd from @receptionist/product.

const dateTime = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});
const date = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" });
const shortDate = new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short" });
const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const monthYear = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const longDate = new Intl.DateTimeFormat(undefined, { weekday: "long", day: "numeric", month: "long" });
const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function formatDateTime(iso: string): string {
  return dateTime.format(new Date(iso));
}

export function formatDate(iso: string): string {
  return date.format(new Date(iso));
}

/** "Oct 3", for ranges and chart axes. */
export function formatShortDate(value: string | Date): string {
  return shortDate.format(new Date(value));
}

/** When a call came in, as a ledger shows it: "4:12 PM" today, "Yesterday, 4:12 PM", then "Oct 28, 4:12 PM". */
export function formatCallTime(iso: string, now = new Date()): string {
  const at = new Date(iso);
  const days = Math.round(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() -
      new Date(at.getFullYear(), at.getMonth(), at.getDate()).getTime()) /
      86_400_000,
  );
  if (days === 0) return time.format(at);
  if (days === 1) return `${capitalize(relative.format(-1, "day"))}, ${time.format(at)}`;
  return dateTime.format(at);
}

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** "Sunday, November 1", for the Overview's label. */
export function formatLongDate(value: Date): string {
  return longDate.format(value);
}

export function formatMonth(iso: string): string {
  return monthYear.format(new Date(iso));
}

/** "5 minutes ago", "yesterday"; falls back to a date after a week. */
export function formatRelative(iso: string, now = Date.now()): string {
  const minutes = Math.round((new Date(iso).getTime() - now) / 60_000);
  if (minutes > -1) return "just now";
  if (minutes > -60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (hours > -24) return relative.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (days > -7) return relative.format(days, "day");
  return formatDate(iso);
}

/** 185 → "3:05". */
export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * "+14155550142" → "+1 (415) 555-0142". Other countries stay in E.164 until we add a phone-number library;
 * grouping digits without each country's rules would be wrong as often as right.
 */
export function formatPhone(e164: string | null): string {
  if (!e164) return "Unknown number";
  const nanp = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return nanp ? `+1 (${nanp[1]}) ${nanp[2]}-${nanp[3]}` : e164;
}

export function formatNumber(value: number): string {
  return value.toLocaleString();
}

/** "Ana Rivera" → "AR". */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
