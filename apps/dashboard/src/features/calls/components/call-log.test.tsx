import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import { formatNumber } from "../../../lib/format";
import { countOutcomes, defaultFilters } from "../filter";
import { mockCalls } from "../mocks";
import { useCallFilters } from "../use-call-filters";
import { CallLog } from "./call-log";

function Page() {
  const [filters, update] = useCallFilters(defaultFilters);
  return <CallLog label="Every call" filters={filters} defaults={defaultFilters} onChange={update} pageSize={8} />;
}

function renderLog(url = "/calls") {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <Page />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const counts = countOutcomes(mockCalls, defaultFilters);

test("each outcome tab shows its count, and a tab filters the table", async () => {
  renderLog();
  const booked = await screen.findByRole("tab", { name: `Booked ${formatNumber(counts.booking ?? 0)}` });
  expect(screen.getByRole("tab", { name: `All calls ${formatNumber(counts.all)}`, selected: true })).toBeDefined();
  expect(await screen.findByText(`Showing 1–8 of ${formatNumber(counts.all)} calls`)).toBeDefined();

  fireEvent.click(booked);
  expect(await screen.findByText(`Showing 1–8 of ${formatNumber(counts.booking ?? 0)} calls`)).toBeDefined();
  const table = within(screen.getByRole("table"));
  await waitFor(() => expect(table.queryAllByText("Transferred")).toHaveLength(0));
  expect(table.getAllByText("Booked").length).toBeGreaterThan(0);
});

test("says when nothing matches, and Clear filters brings the calls back", async () => {
  renderLog("/calls?q=boiler%20on%20the%20moon");
  fireEvent.click(await screen.findByRole("button", { name: "Clear filters" }));
  expect(await screen.findByText(`Showing 1–8 of ${formatNumber(counts.all)} calls`)).toBeDefined();
});
