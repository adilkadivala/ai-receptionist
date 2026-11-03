import type { AdminOrganization } from "./types";

/**
 * Whether a customer matches the search: its name or a receptionist's name contains the words, or one of its numbers
 * contains the digits (so "555 0142", "(555) 0142" and "5550142" all find +1 415 555 0142).
 */
export function matchesCustomer(customer: AdminOrganization, query: string): boolean {
  const words = query.trim().toLocaleLowerCase();
  if (!words) return true;
  const names = [customer.name, ...customer.agents.map((agent) => agent.name)];
  if (names.some((name) => name.toLocaleLowerCase().includes(words))) return true;
  const digits = words.replace(/\D/g, "");
  return digits.length >= 3 && customer.phone_numbers.some((number) => number.e164.includes(digits));
}
