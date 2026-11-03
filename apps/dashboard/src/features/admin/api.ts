import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

// The founders' view across every customer. The api answers only on this computer until there's an admin login
// (apps/server/api/routes/admin.py), so from anywhere else every request here is a 404.

export const adminKeys = {
  all: ["admin"] as const,
  overview: (timeZone: string) => [...adminKeys.all, "overview", timeZone] as const,
  organizations: () => [...adminKeys.all, "organizations"] as const,
  organization: (id: string) => [...adminKeys.all, "organization", id] as const,
  calls: (id: string, page: number, pageSize: number) =>
    [...adminKeys.organization(id), "calls", page, pageSize] as const,
  call: (id: string, callId: string) => [...adminKeys.organization(id), "call", callId] as const,
};

/** A failed admin request. `status` is 404 for a customer or call that doesn't exist, and for a request from elsewhere. */
export class AdminApiError extends Error {
  constructor(readonly status: number) {
    super(`The admin api answered ${status}`);
  }
}

async function read<T>(request: Promise<{ data?: T; response: Response }>): Promise<T> {
  const { data, response } = await request;
  if (!response.ok || data === undefined) throw new AdminApiError(response.status);
  return data;
}

/** The viewer's time zone, so "today" and "this week" start at their midnight and their Monday. */
export function viewerTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function useAdminOverview(timeZone = viewerTimeZone()) {
  return useQuery({
    queryKey: adminKeys.overview(timeZone),
    queryFn: () => read(api.GET("/api/admin/overview", { params: { query: { time_zone: timeZone } } })),
  });
}

export function useAdminOrganizations() {
  return useQuery({
    queryKey: adminKeys.organizations(),
    queryFn: () => read(api.GET("/api/admin/organizations")),
  });
}

export function useAdminOrganization(id: string) {
  return useQuery({
    queryKey: adminKeys.organization(id),
    queryFn: () =>
      read(api.GET("/api/admin/organizations/{organization_id}", { params: { path: { organization_id: id } } })),
    retry: false,
  });
}

/** One page of a customer's calls, newest first. */
export function useAdminCalls(id: string, page: number, pageSize: number) {
  return useQuery({
    queryKey: adminKeys.calls(id, page, pageSize),
    queryFn: () =>
      read(
        api.GET("/api/admin/organizations/{organization_id}/calls", {
          params: { path: { organization_id: id }, query: { page, page_size: pageSize } },
        }),
      ),
    placeholderData: keepPreviousData,
  });
}

/**
 * One call with its transcript. The api writes each fetch to the customer's audit log, so it's fetched once per
 * opening: no refetch on focus, no retries.
 */
export function useAdminCall(id: string, callId: string) {
  return useQuery({
    queryKey: adminKeys.call(id, callId),
    queryFn: () =>
      read(
        api.GET("/api/admin/organizations/{organization_id}/calls/{call_id}", {
          params: { path: { organization_id: id, call_id: callId } },
        }),
      ),
    staleTime: Number.POSITIVE_INFINITY,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
