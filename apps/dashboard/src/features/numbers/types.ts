// Shaped like the `phone_numbers` table (apps/server/core/models.py, docs/architecture.md section 6).
// When the number routes exist, replace these with the generated types from @receptionist/api-client.

export type PhoneNumber = {
  id: string;
  organization_id: string;
  /** The receptionist that answers. Null means calls to this number aren't answered. */
  agent_id: string | null;
  e164: string;
  provider: "telnyx";
  created_at: string;
  /** The owner's name for the number, e.g. "Google Ads line". Not a column yet. */
  label: string | null;
  /** ISO 3166 country code. Not a column yet; the api can derive it from e164. */
  country: string;
};

/** A country we can buy numbers in, from the provider's inventory. */
export type NumberCountry = {
  code: string;
  name: string;
  dial_code: string;
  /** Rules that apply before a number can be bought there. */
  requirement?: string;
};

export type AddNumberInput = {
  country: string;
  area_code: string;
  agent_id: string | null;
  label: string;
};
