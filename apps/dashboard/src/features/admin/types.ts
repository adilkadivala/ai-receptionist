// The admin api's own shapes, generated from the server (apps/server/api/schemas/admin.py). Regenerate with
// `pnpm api:generate` after changing them there.
import type { Schemas } from "@receptionist/api-client";

export type AdminOverview = Schemas["AdminOverview"];
export type AdminOrganization = Schemas["AdminOrganization"];
export type AdminOrganizationDetail = Schemas["AdminOrganizationDetail"];
export type AdminCallPage = Schemas["AdminCallPage"];
export type AdminCallRow = Schemas["AdminCallRow"];
export type AdminCall = Schemas["AdminCall"];

/**
 * Claude's summary of a call, as voice.summary.CallSummary writes it. The column holds JSON, so every field is checked
 * before it's shown.
 */
export type CallSummary = {
  headline?: string;
  caller_name?: string;
  phone_number?: string;
  need?: string;
  urgency?: string;
  outcome?: string;
  next_steps?: string[];
};
