import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the api runs on its own port. In production the dashboard and /api share one domain,
    // so the login cookie works without CORS.
    proxy: { "/api": "http://localhost:8000" },
  },
  test: { environment: "jsdom" },
});
