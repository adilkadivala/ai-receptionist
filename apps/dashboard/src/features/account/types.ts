// Shaped like the planned `organizations`, `users` and `memberships` tables (docs/architecture.md section 6).
// When the auth routes exist, replace these with the generated types from @receptionist/api-client.
import type { PlanId } from "@receptionist/product";

/** Where an organization's data and calls live. The same values as REGIONS in apps/server/core/models.py. */
export type Region = "us" | "eu" | "in";

export type Organization = {
  id: string;
  name: string;
  plan: PlanId | "enterprise";
  region: Region;
  hipaa_mode: boolean;
  created_at: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  created_at: string;
};

export type Role = "owner" | "admin" | "member";

/** The signed-in person and the organization they're working in. */
export type Account = {
  user: User;
  organization: Organization;
  role: Role;
};

export type SignupInput = {
  plan: PlanId;
  name: string;
  business_name: string;
  email: string;
  password: string;
  region: Region;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ProfileInput = {
  name: string;
  email: string;
};
