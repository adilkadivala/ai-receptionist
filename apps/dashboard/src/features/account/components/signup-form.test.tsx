import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import { SignupForm } from "./signup-form";

function renderAt(url: string) {
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[url]}>
        <SignupForm />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

function checkedPlan() {
  const radio = screen.getAllByRole("radio").find((candidate) => candidate.getAttribute("aria-checked") === "true");
  return radio?.closest("label")?.textContent;
}

test("starts on the plan from ?plan=", () => {
  renderAt("/signup?plan=business");
  expect(checkedPlan()).toContain("Business");
});

test("falls back to the first plan for an unknown ?plan=", () => {
  renderAt("/signup?plan=platinum");
  expect(checkedPlan()).toContain("Starter");
});

test("checks the fields, then says sign-up isn't live yet", async () => {
  renderAt("/signup?plan=pro");
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));
  expect(await screen.findByText("Enter your name.")).toBeDefined();

  fireEvent.change(screen.getByLabelText("Your name"), { target: { value: "Maria Okafor" } });
  fireEvent.change(screen.getByLabelText("Business name"), { target: { value: "Harbor Plumbing" } });
  fireEvent.change(screen.getByLabelText("Work email"), { target: { value: "maria@harbor.example" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "correct-horse-battery" } });
  fireEvent.click(screen.getByRole("button", { name: "Create account" }));

  expect(await screen.findByText("Not open yet")).toBeDefined();
  expect(screen.queryByText("Enter your name.")).toBeNull();
});
