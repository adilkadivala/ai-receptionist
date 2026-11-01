import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": resolve(import.meta.dirname, "src") } },
  server: {
    port: 5173,
    // In development the api runs on its own port. In production the dashboard and /api share one domain,
    // so the login cookie works without CORS. Set API_URL when port 8000 is taken by something else.
    proxy: { "/api": process.env.API_URL ?? "http://localhost:8000" },
  },
  build: {
    rolldownOptions: {
      output: {
        // React and its DOM renderer change less often than the app, so browsers keep them cached across deploys.
        // It also keeps the main chunk under the 500 kB warning now that the shell holds search, help and the menus.
        codeSplitting: { groups: [{ name: "react", test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ }] },
      },
    },
  },
  test: { environment: "jsdom", setupFiles: ["src/test-setup.ts"] },
});
