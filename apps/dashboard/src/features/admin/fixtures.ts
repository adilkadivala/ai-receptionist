// Admin api answers for the tests, shaped by the generated types. Not sample data: the admin pages never show mocks.
import { vi } from "vitest";
import { api } from "../../lib/api";
import type {
  AdminCall,
  AdminCallPage,
  AdminCallRow,
  AdminOrganization,
  AdminOrganizationDetail,
  AdminOverview,
} from "./types";

export const plumberId = "6f1c1d5e-7a52-4f5b-9a7e-1d2b3c4d5e6f";
export const clinicId = "0a9b8c7d-6e5f-4a3b-8c2d-1e0f9a8b7c6d";
export const agentId = "1b2c3d4e-5f60-4718-8a9b-0c1d2e3f4a5b";
export const callId = "2c3d4e5f-6071-4829-9bac-1d2e3f4a5b6c";

export const overview: AdminOverview = {
  customers: 2,
  calls_today: 3,
  calls_this_week: 11,
  calls: 40,
  call_seconds_this_week: 1_500,
  call_seconds: 7_260,
  outcomes: [
    { outcome: "message", calls: 25 },
    { outcome: "booking", calls: 10 },
    { outcome: null, calls: 5 },
  ],
};

export const organizations: AdminOrganization[] = [
  {
    id: clinicId,
    name: "Lakeside Family Clinic",
    plan: "enterprise",
    region: "us",
    hipaa_mode: true,
    created_at: "2026-10-22T09:00:00Z",
    phone_numbers: [{ id: "n-2", e164: "+16175550123", agent_id: null }],
    agents: [],
    calls: 0,
    call_seconds: 0,
    last_call_at: null,
  },
  {
    id: plumberId,
    name: "Bright Pipes Plumbing",
    plan: "starter",
    region: "us",
    hipaa_mode: false,
    created_at: "2026-09-24T09:00:00Z",
    phone_numbers: [{ id: "n-1", e164: "+14155550142", agent_id: agentId }],
    agents: [{ id: agentId, name: "Front desk" }],
    calls: 40,
    call_seconds: 7_260,
    last_call_at: "2026-11-03T08:38:00Z",
  },
];

export const plumber: AdminOrganizationDetail = {
  id: plumberId,
  name: "Bright Pipes Plumbing",
  plan: "starter",
  region: "us",
  hipaa_mode: false,
  created_at: "2026-09-24T09:00:00Z",
  phone_numbers: [
    { id: "n-1", e164: "+14155550142", provider: "telnyx", agent_id: agentId, created_at: "2026-09-24T09:00:00Z" },
    { id: "n-3", e164: "+14155550188", provider: "telnyx", agent_id: null, created_at: "2026-09-25T09:00:00Z" },
  ],
  agents: [
    {
      id: agentId,
      name: "Front desk",
      greeting: null,
      languages: ["en", "es"],
      transfer_number: "+14155550100",
      created_at: "2026-09-24T09:00:00Z",
    },
  ],
  calls: 2,
  call_seconds: 300,
  last_call_at: "2026-11-03T08:38:00Z",
};

const newestCall: AdminCallRow = {
  id: callId,
  agent_id: agentId,
  from_number: "+14155558211",
  to_number: "+14155550142",
  language: "en",
  started_at: "2026-11-03T08:38:00Z",
  ended_at: "2026-11-03T08:42:41Z",
  duration_seconds: 281,
  outcome: "message",
  headline: "Ana: water heater making noise",
};

export const plumberCalls: AdminCallPage = {
  items: [
    newestCall,
    {
      id: "3d4e5f60-7182-493a-8bcd-2e3f4a5b6c7d",
      agent_id: agentId,
      from_number: "+14155553004",
      to_number: "+14155550142",
      language: "es",
      started_at: "2026-11-01T18:56:00Z",
      ended_at: "2026-11-01T18:56:19Z",
      duration_seconds: 19,
      outcome: "abandoned",
      headline: null,
    },
  ],
  total: 2,
  page: 1,
  page_size: 25,
};

export const call: AdminCall = {
  ...newestCall,
  organization_id: plumberId,
  agent_name: "Front desk",
  phone_number_id: "n-1",
  cost_usd: 0.145,
  transcript: [
    { role: "ai", text: "Hi, you've reached Bright Pipes Plumbing. How can I help?" },
    { role: "caller", text: "My water heater is making a banging noise." },
  ],
  summary: {
    headline: "Ana: water heater making noise",
    caller_name: "Ana",
    phone_number: "Not given",
    need: "Her water heater bangs when it heats up. She wants someone to look at it this week.",
    urgency: "normal",
    outcome: "callback",
    next_steps: ["Call Ana back to arrange a visit this week."],
  },
};

/**
 * Makes the mocked `api.GET` answer each path with its data, and anything else with a 404, the way openapi-fetch
 * reports it. Pass the path as the api's template, such as "/api/admin/organizations/{organization_id}".
 */
export function answerAdmin(answers: Record<string, unknown>) {
  vi.mocked(api.GET).mockImplementation(((path: string) =>
    Promise.resolve(
      path in answers
        ? { data: answers[path], response: { ok: true, status: 200 } }
        : { error: { detail: "Not Found" }, response: { ok: false, status: 404 } },
    )) as never);
}
