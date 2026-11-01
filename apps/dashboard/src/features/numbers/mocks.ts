// MOCK: sample numbers until the number routes exist (build step 6). Adding or reassigning a number changes this
// module's copy, so it lasts until the page reloads.
import { mockAgentId, mockMainNumber, mockOrganizationId } from "../calls/mocks";
import type { NumberCountry, PhoneNumber } from "./types";

export const mockNumbers: PhoneNumber[] = [
  {
    id: mockMainNumber.id,
    organization_id: mockOrganizationId,
    agent_id: mockAgentId,
    e164: mockMainNumber.e164,
    provider: "telnyx",
    created_at: "2026-08-04T15:25:00Z",
    label: "Main line",
    country: "US",
  },
  {
    id: "num_ads",
    organization_id: mockOrganizationId,
    agent_id: null,
    e164: "+16285550119",
    provider: "telnyx",
    created_at: "2026-10-27T10:02:00Z",
    label: "Google Ads line",
    country: "US",
  },
];

// A few of the provider's countries; the real list comes from the api.
export const mockCountries: NumberCountry[] = [
  { code: "US", name: "United States", dial_code: "+1" },
  { code: "CA", name: "Canada", dial_code: "+1" },
  { code: "GB", name: "United Kingdom", dial_code: "+44", requirement: "Needs a UK address for the business." },
  { code: "AU", name: "Australia", dial_code: "+61", requirement: "Needs an Australian address for the business." },
  { code: "IN", name: "India", dial_code: "+91", requirement: "Needs an Indian registered company." },
];
