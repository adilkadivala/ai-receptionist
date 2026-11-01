import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { mockResponse } from "../../lib/mock";
import { defaultFilters, filterCalls, paginate } from "./filter";
import { mockCalls } from "./mocks";
import type { Call, CallFilters, CallPage } from "./types";

export const callKeys = {
  all: ["calls"] as const,
  list: (filters: CallFilters) => [...callKeys.all, "list", filters] as const,
  detail: (id: string) => [...callKeys.all, "detail", id] as const,
};

/** One page of calls, newest first. The api does the filtering, so only the hook body changes when it exists. */
export function useCalls(filters: CallFilters) {
  return useQuery({
    queryKey: callKeys.list(filters),
    // MOCK: becomes api.GET("/api/calls", { params: { query: filters } }).
    queryFn: (): Promise<CallPage> => mockResponse(paginate(filterCalls(mockCalls, filters), filters.page)),
    // Keep showing the last page while the next filter loads, instead of flashing skeletons.
    placeholderData: keepPreviousData,
  });
}

export function useRecentCalls() {
  return useCalls(defaultFilters);
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
