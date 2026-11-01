import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { mockResponse } from "../../lib/mock";
import { mockPeriodSummary } from "./mocks";

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

export function usePeriodSummary() {
  return useQuery({
    queryKey: ["overview", "period"],
    // MOCK: becomes api.GET("/api/overview").
    queryFn: () => mockResponse(mockPeriodSummary),
  });
}
