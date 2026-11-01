import { Toaster } from "@receptionist/ui/components/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { expect, test } from "vitest";
import { mockConfigs } from "../mocks";
import { ReceptionistForm } from "./receptionist-form";

function renderForm() {
  const config = structuredClone(Object.values(mockConfigs)[0]);
  if (!config) throw new Error("The mocks have no receptionist");
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <ReceptionistForm config={config} />
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>,
  );
  return config;
}

test("won't save an invalid greeting, then saves once it's fixed", async () => {
  const config = renderForm();
  const greeting = screen.getByRole("textbox", { name: "Greeting" });

  fireEvent.change(greeting, { target: { value: "Hi" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByText("Write a greeting of at least 10 characters.")).toBeDefined();
  expect(screen.getByRole("tab", { name: "Greeting, has errors" })).toBeDefined();
  expect(screen.getByRole("status").textContent).toBe("You have unsaved changes.");

  // Errors follow the field once the user has tried to save.
  fireEvent.change(greeting, { target: { value: "Thanks for calling Harbor. How can I help?" } });
  expect(screen.queryByText("Write a greeting of at least 10 characters.")).toBeNull();

  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  // A toast confirms the save, and the save bar keeps saying which version is live.
  expect(await screen.findByText(`Saved. Version ${config.version + 1} is live on your calls.`)).toBeDefined();
  expect(screen.getByText(`Version ${config.version + 1}, saved just now.`)).toBeDefined();
});

test("Discard puts back the saved settings", () => {
  const config = renderForm();
  const greeting = screen.getByRole<HTMLTextAreaElement>("textbox", { name: "Greeting" });

  fireEvent.change(greeting, { target: { value: "Something new to say to callers." } });
  fireEvent.click(screen.getByRole("button", { name: "Discard" }));
  expect(greeting.value).toBe(config.greeting);
});
