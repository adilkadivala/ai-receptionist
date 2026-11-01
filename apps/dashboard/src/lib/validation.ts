// Client-side checks shared by every form. Errors are keyed by field path ("faqs.0.question").

export type Errors = Record<string, string>;

const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The same rule as the phone_numbers.e164 check in apps/server/core/models.py.
const e164 = /^\+[1-9][0-9]{6,14}$/;

export function isEmail(value: string): boolean {
  return email.test(value.trim());
}

export function isE164(value: string): boolean {
  return e164.test(value);
}

/** "+1 (415) 555-0142" → "+14155550142", so people can paste numbers the way they write them. */
export function toE164(value: string): string {
  const trimmed = value.trim();
  return (trimmed.startsWith("+") ? "+" : "") + trimmed.replace(/\D/g, "");
}

export function isEmpty(errors: Errors): boolean {
  return Object.keys(errors).length === 0;
}

/** Adds `message` under `key` when `failed`; returns `errors` for chaining. */
export function check(errors: Errors, key: string, failed: boolean, message: string): Errors {
  if (failed && !(key in errors)) errors[key] = message;
  return errors;
}
