import { expect, test } from "vitest";
import { formatMinutes, knownOutcome, languageName, readSummary } from "./format";

test("talk time in whole minutes, with under a minute shown as such", () => {
  expect([0, 20, 60, 89, 90, 7_260].map(formatMinutes)).toEqual(["0", "<1", "1", "1", "2", "121"]);
});

test("language codes become names, and anything else stays as it came", () => {
  expect(languageName("hi")).toBe("Hindi");
  expect(languageName(null)).toBe("—");
});

test("an outcome the dashboard doesn't know is shown as no outcome", () => {
  expect(knownOutcome("booking")).toBe("booking");
  expect(knownOutcome("teleported")).toBeNull();
  expect(knownOutcome(null)).toBeNull();
});

test("the summary keeps only the text that's there, and drops Claude's 'Not given'", () => {
  expect(readSummary(null)).toBeNull();
  expect(
    readSummary({
      headline: " Ana: water heater ",
      caller_name: "Not given",
      phone_number: 98765,
      urgency: "urgent",
      next_steps: ["Call Ana back.", "", 3],
    }),
  ).toEqual({
    headline: "Ana: water heater",
    caller_name: undefined,
    phone_number: undefined,
    need: undefined,
    urgency: "urgent",
    outcome: undefined,
    next_steps: ["Call Ana back."],
  });
});
