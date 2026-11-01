import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockId, mockResponse } from "../../lib/mock";
import { mockOrganizationId } from "../calls/mocks";
import { mockCountries, mockNumbers } from "./mocks";
import type { AddNumberInput, PhoneNumber } from "./types";

export const numberKeys = {
  all: ["phone-numbers"] as const,
  countries: ["number-countries"] as const,
};

export function usePhoneNumbers() {
  return useQuery({
    queryKey: numberKeys.all,
    // MOCK: becomes api.GET("/api/phone-numbers").
    queryFn: () => mockResponse(mockNumbers),
  });
}

export function useNumberCountries() {
  return useQuery({
    queryKey: numberKeys.countries,
    // MOCK: becomes api.GET("/api/phone-numbers/countries").
    queryFn: () => mockResponse(mockCountries),
    staleTime: Number.POSITIVE_INFINITY,
  });
}

/** Buys a number from the provider and points it at a receptionist. */
export function useAddNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    // MOCK: becomes api.POST("/api/phone-numbers", { body: input }).
    mutationFn: async (input: AddNumberInput): Promise<PhoneNumber> => {
      const dial = mockCountries.find((candidate) => candidate.code === input.country)?.dial_code ?? "+1";
      const area = input.area_code || (dial === "+1" ? "415" : "20");
      const line = String(Math.floor(Math.random() * 100)).padStart(2, "0");
      const number: PhoneNumber = {
        id: mockId("num"),
        organization_id: mockOrganizationId,
        agent_id: input.agent_id,
        e164: `${dial}${area}55501${line}`,
        provider: "telnyx",
        created_at: new Date().toISOString(),
        label: input.label.trim() || null,
        country: input.country,
      };
      mockNumbers.push(number);
      return mockResponse(number);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: numberKeys.all }),
  });
}

/** Points a number at a receptionist, or at none. */
export function useAssignNumber() {
  const queryClient = useQueryClient();
  return useMutation({
    // MOCK: becomes api.PATCH("/api/phone-numbers/{number_id}", { params: { path: { number_id: id } }, body: { agent_id } }).
    mutationFn: async ({ id, agent_id }: { id: string; agent_id: string | null }): Promise<PhoneNumber> => {
      const number = mockNumbers.find((candidate) => candidate.id === id);
      if (!number) throw new Error("Number not found");
      number.agent_id = agent_id;
      return mockResponse(number);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: numberKeys.all }),
  });
}
