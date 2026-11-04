import { addOns, formatUsd, plans } from "@receptionist/product";

// "Plans from $29 a month": the cheapest self-serve plan, formatted.
export const lowestPlanPrice = formatUsd(Math.min(...plans.map((plan) => plan.price)));

// "Your own voice" reads "your own voice" mid-sentence; acronyms like "CRM" stay as they are.
function midSentence(name: string): string {
  const second = name.charAt(1);
  return second === second.toUpperCase() ? name : name.charAt(0).toLowerCase() + name.slice(1);
}

// "your own voice $15 (coming soon) · CRM connection pack $20 · …" for the line under the plans.
export const addOnSummary = addOns
  .map(
    (addOn) =>
      `${midSentence(addOn.name)} ${addOn.from ? "from " : ""}${formatUsd(addOn.price)}${addOn.soon ? " (coming soon)" : ""}`,
  )
  .join(" · ");
