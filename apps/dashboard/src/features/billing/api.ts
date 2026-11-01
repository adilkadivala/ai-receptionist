import { findPlan, type PlanId } from "@receptionist/product";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mockResponse } from "../../lib/mock";
import { computeUsage } from "../../lib/usage";
import { mockInvoices, mockSubscription, mockUsage } from "./mocks";
import type { Subscription } from "./types";

export const billingKeys = {
  subscription: ["billing", "subscription"] as const,
  usage: ["billing", "usage"] as const,
  invoices: ["billing", "invoices"] as const,
};

export function useSubscription() {
  return useQuery({
    queryKey: billingKeys.subscription,
    // MOCK: becomes api.GET("/api/billing/subscription").
    queryFn: () => mockResponse(mockSubscription),
  });
}

export function useUsageRollup() {
  return useQuery({
    queryKey: billingKeys.usage,
    // MOCK: becomes api.GET("/api/billing/usage").
    queryFn: () => mockResponse(mockUsage),
  });
}

/** Minutes used this period against the current plan, worked out with computeUsage. */
export function usePlanUsage() {
  const subscription = useSubscription();
  const rollup = useUsageRollup();
  const plan = findPlan(subscription.data?.plan);

  return {
    isPending: subscription.isPending || rollup.isPending,
    isError: subscription.isError || rollup.isError,
    plan,
    subscription: subscription.data,
    rollup: rollup.data,
    usage:
      plan && rollup.data
        ? computeUsage({
            used: rollup.data.minutes_used,
            included: plan.minutes,
            periodStart: rollup.data.period_start,
            periodEnd: rollup.data.period_end,
          })
        : undefined,
  };
}

export function useInvoices() {
  return useQuery({
    queryKey: billingKeys.invoices,
    // MOCK: becomes api.GET("/api/billing/invoices").
    queryFn: () => mockResponse(mockInvoices),
  });
}

/** Moves to another plan from the next billing period. */
export function useChangePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    // MOCK: becomes api.POST("/api/billing/plan", { body: { plan } }), which goes through Dodo.
    mutationFn: async (plan: PlanId): Promise<Subscription> => {
      mockSubscription.plan = plan;
      return mockResponse(mockSubscription);
    },
    onSuccess: (subscription) => queryClient.setQueryData(billingKeys.subscription, subscription),
  });
}

/** Turns an add-on on or off. */
export function useToggleAddOn() {
  const queryClient = useQueryClient();
  return useMutation({
    // MOCK: becomes api.PUT / api.DELETE("/api/billing/add-ons/{add_on_id}").
    mutationFn: async ({ id, on }: { id: string; on: boolean }): Promise<Subscription> => {
      mockSubscription.add_ons = on
        ? [...new Set([...mockSubscription.add_ons, id])]
        : mockSubscription.add_ons.filter((addOn) => addOn !== id);
      return mockResponse(mockSubscription);
    },
    onSuccess: (subscription) => queryClient.setQueryData(billingKeys.subscription, subscription),
  });
}
