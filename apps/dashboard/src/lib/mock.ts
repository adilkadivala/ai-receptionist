// MOCK: stands in for api routes that don't exist yet (build step 6). It's only called from hook bodies in
// src/features/*/api.ts. When a route lands, that hook's body becomes `api.GET(...)`; when none are left, delete this file.

const delayMs = import.meta.env.MODE === "test" ? 0 : 350;

/** Resolves with a copy of `data` after a short delay, like a network round trip. */
export async function mockResponse<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, delayMs));
  return structuredClone(data);
}

/** An ISO timestamp this long before now, so sample data always looks recent. */
export function ago({ days = 0, hours = 0, minutes = 0 }: { days?: number; hours?: number; minutes?: number }): string {
  return new Date(Date.now() - ((days * 24 + hours) * 60 + minutes) * 60_000).toISOString();
}

/** A fake id for rows the mock creates. */
export function mockId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
