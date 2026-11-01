import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { mockResponse } from "../../lib/mock";
import { countOutcomes, pageSize as defaultPageSize, filterCalls, paginate } from "./filter";
import { mockCalls } from "./mocks";
import type { Call, CallFilters, CallPage, CallsToday } from "./types";

export const callKeys = {
  all: ["calls"] as const,
  list: (filters: CallFilters, pageSize: number) => [...callKeys.all, "list", filters, pageSize] as const,
  detail: (id: string) => [...callKeys.all, "detail", id] as const,
  today: () => [...callKeys.all, "today"] as const,
};

/** One page of calls, newest first. The api does the filtering, so only the hook body changes when it exists. */
export function useCalls(filters: CallFilters, pageSize = defaultPageSize) {
  return useQuery({
    queryKey: callKeys.list(filters, pageSize),
    // MOCK: becomes api.GET("/api/calls", { params: { query: { ...filters, page_size: pageSize } } }).
    queryFn: (): Promise<CallPage> =>
      mockResponse({
        ...paginate(filterCalls(mockCalls, filters), filters.page, pageSize),
        outcome_counts: countOutcomes(mockCalls, filters),
      }),
    // Keep showing the last page while the next filter loads, instead of flashing skeletons.
    placeholderData: keepPreviousData,
  });
}

export function useCall(id: string) {
  return useQuery({
    queryKey: callKeys.detail(id),
    // MOCK: becomes api.GET("/api/calls/{call_id}", { params: { path: { call_id: id } } }).
    queryFn: async (): Promise<Call> => {
      const call = mockCalls.find((candidate) => candidate.id === id);
      if (!call) throw new Error("Call not found");
      return mockResponse(call);
    },
    retry: false,
  });
}

export function useCallsToday() {
  return useQuery({
    queryKey: callKeys.today(),
    // MOCK: becomes api.GET("/api/calls/today").
    queryFn: (): Promise<CallsToday> => {
      const today = filterCalls(mockCalls, { q: "", outcome: "", language: "", range: "today", page: 1 });
      return mockResponse({
        answered: today.filter((call) => call.outcome !== "spam").length,
        messages: today.filter((call) => call.outcome === "message").length,
      });
    },
  });
}
