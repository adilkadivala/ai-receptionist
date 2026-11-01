import { overagePerMinute } from "@receptionist/product";

/** Above this share of the included minutes, the meter turns amber. */
export const nearLimitAt = 0.8;

export type UsageStatus = "ok" | "near" | "over";

export type Usage = {
  used: number;
  included: number;
  remaining: number;
  /** 0–100 for the progress bar; stays at 100 once over. */
  percent: number;
  overMinutes: number;
  /** USD for the minutes over the plan, at the published per-minute rate. */
  overCost: number;
  /** Minutes by the end of the billing period if calls keep coming at this month's pace. */
  projected: number;
  status: UsageStatus;
};

/**
 * Minutes used against the plan. Calls are billed per started minute (see `billedMinutes`), so
 * `used` is already whole minutes from the usage rollup.
 */
export function computeUsage({
  used,
  included,
  periodStart,
  periodEnd,
  now = new Date(),
}: {
  used: number;
  included: number;
  periodStart: string;
  periodEnd: string;
  now?: Date;
}): Usage {
  const start = new Date(periodStart).getTime();
  const end = new Date(periodEnd).getTime();
  const elapsed = Math.min(Math.max((now.getTime() - start) / (end - start), 0), 1);
  // Too early in the period to project from a few hours of calls: assume what's used so far.
  const projected = elapsed < 0.1 ? used : Math.round(used / elapsed);
  const overMinutes = Math.max(used - included, 0);
  const ratio = included > 0 ? used / included : used > 0 ? Infinity : 0;

  return {
    used,
    included,
    remaining: Math.max(included - used, 0),
    percent: Math.min(Math.round(ratio * 100), 100),
    overMinutes,
    overCost: Math.round(overMinutes * overagePerMinute * 100) / 100,
    projected,
    status: overMinutes > 0 ? "over" : ratio >= nearLimitAt || projected > included ? "near" : "ok",
  };
}

/** A call counts every started minute: 61 seconds is 2 minutes. */
export function billedMinutes(durationSeconds: number | null): number {
  return durationSeconds ? Math.ceil(durationSeconds / 60) : 0;
}
