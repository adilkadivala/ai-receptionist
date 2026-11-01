import { formatUsd, plans } from "@receptionist/product";

// "Plans from $29 a month": the cheapest self-serve plan, formatted.
export const lowestPlanPrice = formatUsd(Math.min(...plans.map((plan) => plan.price)));
