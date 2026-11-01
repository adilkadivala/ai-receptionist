// MOCK: the Overview's numbers until GET /api/overview and GET /api/overview/volume exist (build step 6), counted from
// the sample calls so they match the call table.
import { mockCalls } from "../calls/mocks";
import type { DateRange } from "../calls/types";
import { dailyVolume, summarize } from "./summary";

export const mockPeriodSummary = (range: DateRange) => summarize(mockCalls, range);

/** Three months of days, the chart's longest range. */
export const mockVolume = () => dailyVolume(mockCalls, 90);
