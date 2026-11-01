import { describe, expect, test } from "vitest";
import { mockConfigs } from "./mocks";
import type { AgentSettings } from "./types";
import { sectionOf, validateAgentSettings } from "./validation";

const config = Object.values(mockConfigs)[0];
if (!config) throw new Error("The mocks have no receptionist");
const { id: _id, agent_id: _agent, version: _version, created_at: _created, ...sample } = config;

function settings(overrides: Partial<AgentSettings>): AgentSettings {
  return { ...structuredClone(sample), ...overrides };
}

describe("validateAgentSettings", () => {
  test("accepts the sample receptionist", () => {
    expect(validateAgentSettings(sample)).toEqual({});
  });

  test("needs a greeting that's neither empty nor a speech", () => {
    expect(validateAgentSettings(settings({ greeting: "  Hi " }))).toHaveProperty("greeting");
    expect(validateAgentSettings(settings({ greeting: "x".repeat(301) }))).toHaveProperty("greeting");
  });

  test("needs the business name and what it does", () => {
    const errors = validateAgentSettings(settings({ business_name: " ", business_info: "" }));
    expect(Object.keys(errors)).toEqual(["business_name", "business_info"]);
  });

  test("checks opening hours only on open days", () => {
    const hours = { ...sample.hours, tue: { open: true, from: "18:00", to: "09:00" } };
    expect(validateAgentSettings(settings({ hours }))).toEqual({
      "hours.tue": "Closing time must be after opening time.",
    });
    const closed = { ...sample.hours, tue: { open: false, from: "18:00", to: "09:00" } };
    expect(validateAgentSettings(settings({ hours: closed }))).toEqual({});
  });

  test("needs at least one language", () => {
    expect(validateAgentSettings(settings({ languages: [] }))).toHaveProperty("languages");
  });

  test("checks each transfer number's format and catches duplicates", () => {
    const transfer = { id: "a", label: "Office", e164: "+14155550110", when: "" };
    const errors = validateAgentSettings(
      settings({
        transfer_numbers: [
          transfer,
          { ...transfer, id: "b", label: "" },
          { ...transfer, id: "c", e164: "415 555 0110" },
          { ...transfer, id: "d", e164: "+0123456" },
        ],
      }),
    );
    expect(errors).toEqual({
      "transfer_numbers.1.label": "Say who picks up.",
      "transfer_numbers.1.e164": "This number is already in the list.",
      "transfer_numbers.2.e164": "Use the international format with country code, like +14155550123.",
      "transfer_numbers.3.e164": "Use the international format with country code, like +14155550123.",
    });
  });

  test("caps transfer numbers at five", () => {
    const transfer_numbers = Array.from({ length: 6 }, (_, index) => ({
      id: String(index),
      label: "Desk",
      e164: `+1415555010${index}`,
      when: "",
    }));
    expect(validateAgentSettings(settings({ transfer_numbers }))).toHaveProperty("transfer_numbers");
  });

  test("needs both halves of an FAQ entry", () => {
    const errors = validateAgentSettings(
      settings({
        faqs: [
          { id: "a", question: "Parking?", answer: " " },
          { id: "b", question: "", answer: "Yes" },
        ],
      }),
    );
    expect(Object.keys(errors)).toEqual(["faqs.0.answer", "faqs.1.question"]);
  });
});

test("sectionOf maps each field to its tab", () => {
  expect(sectionOf("greeting")).toBe("greeting");
  expect(sectionOf("hours.mon")).toBe("business");
  expect(sectionOf("time_zone")).toBe("business");
  expect(sectionOf("languages")).toBe("languages");
  expect(sectionOf("voice_id")).toBe("voice");
  expect(sectionOf("transfer_numbers.2.e164")).toBe("transfers");
  expect(sectionOf("faqs.0.answer")).toBe("faqs");
});
