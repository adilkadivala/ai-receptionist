import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { mockResponse } from "../../lib/mock";
import type { DateRange } from "../calls/types";
import { mockPeriodSummary, mockVolume } from "./mocks";

/** The api's own health check: the one real route so far. */
export function useHealth() {
  return useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const { data, error } = await api.GET("/api/health");
      if (error || !data) throw new Error("The api didn't answer");
      return data;
    },
  });
}

export function usePeriodSummary(range: DateRange) {
  return useQuery({
    queryKey: ["overview", "summary", range],
    // MOCK: becomes api.GET("/api/overview", { params: { query: { range } } }).
    queryFn: () => mockResponse(mockPeriodSummary(range)),
    placeholderData: keepPreviousData,
  });
}

/** Calls answered and booked per day for the last 90 days. The chart picks its range from these. */
export function useCallVolume() {
  return useQuery({
    queryKey: ["overview", "volume"],
    // MOCK: becomes api.GET("/api/overview/volume", { params: { query: { days: 90 } } }).
    queryFn: () => mockResponse(mockVolume()),
  });
}
