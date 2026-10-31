import createClient from "openapi-fetch";
import type { components, paths } from "./schema";

export type Schemas = components["schemas"];

/**
 * A client whose paths, parameters and responses are typed from the server's OpenAPI description.
 * Regenerate after changing the api: `pnpm api:generate` from the repository root.
 */
export function createApiClient(baseUrl = "") {
  return createClient<paths>({ baseUrl, credentials: "include" });
}

export type ApiClient = ReturnType<typeof createApiClient>;
