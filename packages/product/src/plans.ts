// Plans, add-ons and contract pricing. Mirrors the README's "Plans and pricing"; change both together.
import { languageCount } from "./languages";

export type PlanId = "starter" | "pro" | "business";

export type Plan = {
  id: PlanId;
  name: string;
  price: number; // USD a month
  minutes: number; // call minutes included each month
  for: string;
  featured?: boolean;
};

export const plans: readonly Plan[] = [
  { id: "starter", name: "Starter", price: 29, minutes: 100, for: "One business, one number" },
  { id: "pro", name: "Pro", price: 79, minutes: 350, for: "Busy small businesses", featured: true },
  { id: "business", name: "Business", price: 149, minutes: 700, for: "Several numbers and calendars" },
];

export function findPlan(id: string | null | undefined): Plan | undefined {
  return plans.find((plan) => plan.id === id);
}

export const overagePerMinute = 0.2;

export const included = [
  `All ${languageCount} languages`,
  "Transfer to a person",
  "Summary and transcript of every call",
  "Appointment booking (coming soon)",
  "Spam blocking (coming soon)",
];

/** `soon`: not built yet, and shown as coming soon. */
export type AddOn = { id: string; name: string; price: number; from?: boolean; soon?: boolean; description: string };

export const addOns: readonly AddOn[] = [
  {
    id: "voice-clone",
    name: "Your own voice",
    price: 15,
    soon: true,
    description: "The receptionist speaks in the owner's cloned voice, after a recorded consent.",
  },
  {
    id: "crm-pack",
    name: "CRM connection pack",
    price: 20,
    soon: true,
    description: "HubSpot, Salesforce and ServiceTitan.",
  },
  { id: "extra-number", name: "Extra phone number", price: 10, description: "Another local number on the same plan." },
  {
    id: "white-label",
    name: "White-label",
    price: 199,
    from: true,
    soon: true,
    description: "Agencies resell the receptionist under their own brand.",
  },
];

// Hotels, hospitals and large companies: priced per minute and billed by invoice.
export const contractFromPerMinute = 0.16;

export function formatUsd(amount: number): string {
  return Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;
}
