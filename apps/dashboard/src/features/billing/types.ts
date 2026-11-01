// Shaped like the planned `usage_rollups` table and the billing records Dodo will keep (docs/architecture.md section 6,
// build step 8). When the billing routes exist, replace these with the generated types from @receptionist/api-client.
import type { PlanId } from "@receptionist/product";

/** Minutes and calls so far in one billing period: a monthly total of `usage_events`. */
export type UsageRollup = {
  organization_id: string;
  period_start: string;
  period_end: string;
  minutes_used: number;
  calls_count: number;
  updated_at: string;
};

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type Subscription = {
  organization_id: string;
  plan: PlanId;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  /** Ids from `addOns` in @receptionist/product. */
  add_ons: string[];
};

export type InvoiceStatus = "paid" | "open" | "failed" | "void";

export type Invoice = {
  id: string;
  number: string;
  issued_at: string;
  period_start: string;
  period_end: string;
  amount_usd: number;
  status: InvoiceStatus;
  lines: { description: string; amount_usd: number }[];
};
