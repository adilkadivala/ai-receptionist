import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, expect, test, vi } from "vitest";
import { answerAdmin, clinicId, organizations, plumberId } from "../../features/admin/fixtures";
import { AdminCustomersPage } from "./AdminCustomersPage";

vi.mock("../../lib/api", () => ({ api: { GET: vi.fn() } }));

afterEach(() => vi.resetAllMocks());

function renderPage(url = "/admin/customers") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <AdminCustomersPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const names = () =>
  within(screen.getByRole("table"))
    .queryAllByRole("link")
    .map((link) => link.textContent);

test("lists every customer with its plan, numbers and calls, each a link to the customer", async () => {
  answerAdmin({ "/api/admin/organizations": organizations });
  renderPage();

  const clinic = await screen.findByRole("link", { name: "Lakeside Family Clinic" });
  expect(clinic.getAttribute("href")).toBe(`/admin/customers/${clinicId}`);
  expect(screen.getByRole("link", { name: "Bright Pipes Plumbing" }).getAttribute("href")).toBe(
    `/admin/customers/${plumberId}`,
  );
  const clinicRow = within(clinic.closest("tr") as HTMLElement);
  expect(clinicRow.getByText("HIPAA")).toBeDefined();
  expect(clinicRow.getByText(/Enterprise · US/)).toBeDefined();
  expect(clinicRow.getByText("No calls yet")).toBeDefined();
  const plumberRow = within(screen.getByRole("link", { name: "Bright Pipes Plumbing" }).closest("tr") as HTMLElement);
  expect(plumberRow.getByText("+1 (415) 555-0142")).toBeDefined();
  expect(plumberRow.getByText("Front desk")).toBeDefined();
  // 7,260 seconds is 121 minutes.
  expect(plumberRow.getByText("121")).toBeDefined();
  expect(screen.getByText(/2 customers, newest first/)).toBeDefined();
});

test("finds a customer by name, or by a few digits of a number however they're typed", async () => {
  answerAdmin({ "/api/admin/organizations": organizations });
  renderPage();
  const search = await screen.findByRole("searchbox", { name: "Search customers by name or phone number" });
  await screen.findByRole("link", { name: "Bright Pipes Plumbing" });

  fireEvent.change(search, { target: { value: "lakeside" } });
  expect(names()).toEqual(["Lakeside Family Clinic"]);
  fireEvent.change(search, { target: { value: "(415) 555-0142" } });
  expect(names()).toEqual(["Bright Pipes Plumbing"]);
  fireEvent.change(search, { target: { value: "front desk" } });
  expect(names()).toEqual(["Bright Pipes Plumbing"]);
});

test("says when no customer matches, and Clear search brings them back", async () => {
  answerAdmin({ "/api/admin/organizations": organizations });
  renderPage("/admin/customers?q=boiler");

  expect(await screen.findByText("No customer matches")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(names()).toEqual(["Lakeside Family Clinic", "Bright Pipes Plumbing"]);
});

test("says when there are no customers yet", async () => {
  answerAdmin({ "/api/admin/organizations": [] });
  renderPage();
  expect(await screen.findByText("No customers yet")).toBeDefined();
});
