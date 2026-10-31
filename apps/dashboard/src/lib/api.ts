import { createApiClient } from "@receptionist/api-client";

// Same origin as the dashboard: Vite proxies /api in development, the reverse proxy does in production.
export const api = createApiClient();
