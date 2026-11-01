// MOCK: sample billing until the billing routes exist (build step 8). Usage is counted from the sample calls, and
// invoice amounts come from the plan and add-on prices in @receptionist/product, so they stay in step.
import { addOns, findPlan, overagePerMinute } from "@receptionist/product";
import { billedMinutes } from "../../lib/usage";
import { mockCalls, mockOrganizationId } from "../calls/mocks";
import type { Invoice, Subscription, UsageRollup } from "./types";

const day = 86_400_000;

function startOfDay(daysAgo: number): Date {
  const date = new Date(Date.now() - daysAgo * day);
  date.setHours(0, 0, 0, 0);
  return date;
}

// The current period started 17 days ago; each period is 30 days.
const periodStart = startOfDay(17);
const periodEnd = new Date(periodStart.getTime() + 30 * day);

export const mockSubscription: Subscription = {
  organization_id: mockOrganizationId,
  plan: "pro",
  status: "active",
  current_period_start: periodStart.toISOString(),
  current_period_end: periodEnd.toISOString(),
  add_ons: ["extra-number"],
};

/** The calls in one period, as the usage rollup job would count them. Spam is blocked before it costs minutes. */
export function callsBetween(start: Date, end: Date) {
  return mockCalls.filter((call) => {
    const time = new Date(call.started_at).getTime();
    return time >= start.getTime() && time < end.getTime();
  });
}

const billable = callsBetween(periodStart, periodEnd).filter((call) => call.outcome !== "spam");

export const mockUsage: UsageRollup = {
  organization_id: mockOrganizationId,
  period_start: mockSubscription.current_period_start,
  period_end: mockSubscription.current_period_end,
  minutes_used: billable.reduce((sum, call) => sum + billedMinutes(call.duration_seconds), 0),
  calls_count: billable.length,
  updated_at: new Date().toISOString(),
};

function invoiceFor(index: number, overMinutes: number): Invoice {
  const plan = findPlan(mockSubscription.plan);
  const extraNumber = addOns.find((addOn) => addOn.id === "extra-number");
  const start = new Date(periodStart.getTime() - (index + 1) * 30 * day);
  const end = new Date(start.getTime() + 30 * day);
  const lines = [
    { description: `${plan?.name} plan`, amount_usd: plan?.price ?? 0 },
    ...(extraNumber ? [{ description: extraNumber.name, amount_usd: extraNumber.price }] : []),
    ...(overMinutes > 0
      ? [
          {
            description: `${overMinutes} extra minutes`,
            amount_usd: Math.round(overMinutes * overagePerMinute * 100) / 100,
          },
        ]
      : []),
  ];
  return {
    id: `inv_${index}`,
    number: `RVP-${String(1042 - index).padStart(4, "0")}`,
    issued_at: end.toISOString(),
    period_start: start.toISOString(),
    period_end: end.toISOString(),
    amount_usd: Math.round(lines.reduce((sum, line) => sum + line.amount_usd, 0) * 100) / 100,
    status: "paid",
    lines,
  };
}

export const mockInvoices: Invoice[] = [invoiceFor(0, 12), invoiceFor(1, 0), invoiceFor(2, 0)];
