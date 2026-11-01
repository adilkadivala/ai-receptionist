// MOCK: sample account until the auth routes exist (build step 6). Delete with the hook bodies that use it.
import type { Account } from "./types";

export const mockAccount: Account = {
  user: {
    id: "usr_maria",
    name: "Maria Okafor",
    email: "maria@harborplumbing.example",
    created_at: "2026-08-04T15:12:00Z",
  },
  organization: {
    id: "org_harbor",
    name: "Harbor Plumbing & Heating",
    plan: "pro",
    region: "us",
    hipaa_mode: false,
    created_at: "2026-08-04T15:12:00Z",
  },
  role: "owner",
};
