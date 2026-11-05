import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import { answerAdmin, call, callId, plumber, plumberCalls, plumberId } from "../../features/admin/fixtures";
import { AdminCustomerPage } from "./AdminCustomerPage";

vi.mock("../../lib/api", () => ({ api: { GET: vi.fn() } }));

afterEach(() => vi.resetAllMocks());

const customerPath = "/api/admin/organizations/{organization_id}";
const callsPath = "/api/admin/organizations/{organization_id}/calls";
const callPath = "/api/admin/organizations/{organization_id}/calls/{call_id}";

function renderPage(url: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="/admin/customers/:id" element={<AdminCustomerPage />}>
            <Route path="calls/:callId" />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

test("shows the customer's numbers, receptionists and calls, newest first", async () => {
  answerAdmin({ [customerPath]: plumber, [callsPath]: plumberCalls });
  renderPage(`/admin/customers/${plumberId}`);

  expect(await screen.findByRole("heading", { name: "Bright Pipes Plumbing" })).toBeDefined();
  expect(screen.getByText(/Starter plan · data kept in US/)).toBeDefined();
  expect(screen.getByText("Answered by Front desk")).toBeDefined();
  // The second number has no receptionist.
  expect(screen.getByText("Not answered")).toBeDefined();
  const receptionists = within(
    screen.getByRole("heading", { name: "Receptionists" }).closest("[data-slot=card]") as HTMLElement,
  );
  expect(receptionists.getByText("Front desk")).toBeDefined();
  expect(receptionists.getByText("English")).toBeDefined();
  expect(receptionists.getByText("Spanish")).toBeDefined();
  expect(receptionists.getByText("+1 (415) 555-0100")).toBeDefined();

  const calls = within(screen.getByRole("region", { name: "Calls" }));
  const links = await calls.findAllByRole("link");
  expect(links.map((link) => link.textContent)).toEqual(["+1 (415) 555-8211", "+1 (415) 555-3004"]);
  expect(links[0]?.getAttribute("href")).toBe(`/admin/customers/${plumberId}/calls/${callId}`);
  expect(calls.getByText("Message taken")).toBeDefined();
  expect(calls.getByText("Hung up")).toBeDefined();
  expect(calls.getAllByText(/Ana: water heater making noise/).length).toBeGreaterThan(0);
});

test("a call opens with everything about it: facts, summary and the whole transcript", async () => {
  answerAdmin({ [customerPath]: plumber, [callsPath]: plumberCalls, [callPath]: call });
  renderPage(`/admin/customers/${plumberId}/calls/${callId}`);

  const sheet = within(await screen.findByRole("dialog"));
  expect(await sheet.findByText("My water heater is making a banging noise.")).toBeDefined();
  expect(sheet.getByText("Hi, you've reached Bright Pipes Plumbing. How can I help?")).toBeDefined();
  expect(sheet.getByRole("heading", { name: "Summary" })).toBeDefined();
  expect(sheet.getByText("Call Ana back to arrange a visit this week.")).toBeDefined();
  // Claude writes "Not given" for what the caller didn't say; that's left out rather than shown.
  expect(sheet.queryByText("Number they gave")).toBeNull();
  expect(sheet.getByText("4:41")).toBeDefined();
  expect(sheet.getByText("+1 (415) 555-0142")).toBeDefined();
  expect(sheet.getByText(/recorded in Bright Pipes Plumbing's audit log/)).toBeDefined();
});

test("a call without a summary shows no summary section", async () => {
  answerAdmin({ [customerPath]: plumber, [callsPath]: plumberCalls, [callPath]: { ...call, summary: null } });
  renderPage(`/admin/customers/${plumberId}/calls/${callId}`);

  const sheet = within(await screen.findByRole("dialog"));
  expect(await sheet.findByText("My water heater is making a banging noise.")).toBeDefined();
  expect(sheet.queryByRole("heading", { name: "Summary" })).toBeNull();
});

test("says so when there's no such customer", async () => {
  answerAdmin({});
  renderPage(`/admin/customers/${plumberId}`);
  expect(await screen.findByText("There's no such customer")).toBeDefined();
});
