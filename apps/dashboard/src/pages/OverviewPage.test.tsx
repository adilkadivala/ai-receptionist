import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { api } from "../lib/api";
import { OverviewPage } from "./OverviewPage";

vi.mock("../lib/api", () => ({ api: { GET: vi.fn() } }));

afterEach(() => vi.resetAllMocks());

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <OverviewPage />
    </QueryClientProvider>,
  );
}

test("shows missing provider keys from the api", async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: { ok: true, missing: ["SONIOX_API_KEY"] } } as never);
  renderPage();
  expect(await screen.findByText("Connected, but some provider keys are missing")).toBeDefined();
  expect(screen.getByText("SONIOX_API_KEY")).toBeDefined();
  expect(api.GET).toHaveBeenCalledWith("/api/health");
});

test("says when every key is set", async () => {
  vi.mocked(api.GET).mockResolvedValue({ data: { ok: true, missing: [] } } as never);
  renderPage();
  expect(await screen.findByText("Every provider key is set.")).toBeDefined();
});

test("says so when the api is down", async () => {
  vi.mocked(api.GET).mockResolvedValue({ error: "Bad Gateway" } as never);
  renderPage();
  expect(await screen.findByText("Can't reach the api")).toBeDefined();
});
