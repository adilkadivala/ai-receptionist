import { overagePerMinute } from "@receptionist/product";
import { describe, expect, test } from "vitest";
import { billedMinutes, computeUsage } from "./usage";

// A 30-day period, checked halfway through.
const period = { periodStart: "2026-11-01T00:00:00Z", periodEnd: "2026-12-01T00:00:00Z" };
const halfway = new Date("2026-11-16T00:00:00Z");

describe("computeUsage", () => {
  test("well inside the plan", () => {
    const usage = computeUsage({ used: 100, included: 350, ...period, now: halfway });
    expect(usage).toMatchObject({ remaining: 250, percent: 29, overMinutes: 0, overCost: 0, status: "ok" });
  });

  test("warns from 80% of the included minutes", () => {
    expect(computeUsage({ used: 279, included: 350, ...period, now: new Date("2026-11-29T00:00:00Z") }).status).toBe(
      "ok",
    );
    expect(computeUsage({ used: 280, included: 350, ...period, now: new Date("2026-11-29T00:00:00Z") }).status).toBe(
      "near",
    );
  });

  test("warns when this month's pace will run past the plan", () => {
    // 200 minutes in half a month is about 400 by the end, over the 350 included.
    const usage = computeUsage({ used: 200, included: 350, ...period, now: halfway });
    expect(usage.projected).toBe(400);
    expect(usage.status).toBe("near");
  });

  test("doesn't project from the first few days", () => {
    const usage = computeUsage({ used: 40, included: 100, ...period, now: new Date("2026-11-02T00:00:00Z") });
    expect(usage.projected).toBe(40);
    expect(usage.status).toBe("ok");
  });

  test("charges minutes over the plan at the published rate", () => {
    const usage = computeUsage({ used: 362, included: 350, ...period, now: halfway });
    expect(usage).toMatchObject({ remaining: 0, percent: 100, overMinutes: 12, status: "over" });
    expect(usage.overCost).toBe(Math.round(12 * overagePerMinute * 100) / 100);
  });

  test("a plan with no minutes is over as soon as one is used", () => {
    expect(computeUsage({ used: 0, included: 0, ...period, now: halfway }).status).toBe("ok");
    expect(computeUsage({ used: 1, included: 0, ...period, now: halfway })).toMatchObject({
      percent: 100,
      status: "over",
    });
  });
});

test("billedMinutes counts every started minute", () => {
  expect(billedMinutes(null)).toBe(0);
  expect(billedMinutes(0)).toBe(0);
  expect(billedMinutes(1)).toBe(1);
  expect(billedMinutes(60)).toBe(1);
  expect(billedMinutes(61)).toBe(2);
});
