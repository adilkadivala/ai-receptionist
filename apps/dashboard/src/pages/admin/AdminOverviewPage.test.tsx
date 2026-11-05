import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import { viewerTimeZone } from "../../features/admin/api";
import { answerAdmin, overview } from "../../features/admin/fixtures";
import { api } from "../../lib/api";
import { AdminOverviewPage } from "./AdminOverviewPage";

vi.mock("../../lib/api", () => ({ api: { GET: vi.fn() } }));

afterEach(() => vi.resetAllMocks());

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={["/admin"]}>
        <AdminOverviewPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

test("shows the totals across every customer, counted in the viewer's time zone", async () => {
  answerAdmin({ "/api/admin/overview": overview });
  renderPage();

  const totals = within(await screen.findByRole("region", { name: "Totals across every customer" }));
  expect(await totals.findByText("40")).toBeDefined();
  expect(totals.getByText("Customers").parentElement?.parentElement?.textContent).toContain("2");
  expect(totals.getByText("Calls today").parentElement?.parentElement?.textContent).toContain("3");
  expect(totals.getByText("Calls this week").parentElement?.parentElement?.textContent).toContain("11");
  // 7,260 seconds of talk time is 121 minutes; 1,500 this week is 25.
  expect(totals.getByText("121")).toBeDefined();
  expect(totals.getByText("25")).toBeDefined();
  expect(totals.getByText("5 without an outcome yet")).toBeDefined();
  expect(api.GET).toHaveBeenCalledWith("/api/admin/overview", { params: { query: { time_zone: viewerTimeZone() } } });
});

test("breaks the calls down by outcome, most first", async () => {
  answerAdmin({ "/api/admin/overview": overview });
  renderPage();

  const rows = within(await screen.findByRole("list", { name: "Calls by outcome" })).getAllByRole("listitem");
  expect(rows.map((row) => row.textContent)).toEqual(["Message taken2563%", "Booked1025%", "No outcome yet513%"]);
});

test("says so when nobody has called yet", async () => {
  answerAdmin({ "/api/admin/overview": { ...overview, calls: 0, outcomes: [] } });
  renderPage();
  expect(await screen.findByText("No calls yet")).toBeDefined();
});

test("says so when the api doesn't answer", async () => {
  answerAdmin({});
  renderPage();
  expect(await screen.findByText("Couldn't load the totals")).toBeDefined();
});
