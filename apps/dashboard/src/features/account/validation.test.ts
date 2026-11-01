import { expect, test } from "vitest";
import { isE164, toE164 } from "../../lib/validation";
import type { SignupInput } from "./types";
import { validateLogin, validateSignup } from "./validation";

const valid: SignupInput = {
  plan: "pro",
  name: "Maria Okafor",
  business_name: "Harbor Plumbing & Heating",
  email: "maria@harborplumbing.example",
  password: "correct-horse-battery",
  region: "us",
};

test("accepts a complete sign-up", () => {
  expect(validateSignup(valid)).toEqual({});
});

test("says what's missing from a sign-up, one message per field", () => {
  expect(validateSignup({ ...valid, name: " ", business_name: "", email: "", password: "short" })).toEqual({
    name: "Enter your name.",
    business_name: "Enter your business's name.",
    email: "Enter your email address.",
    password: "Use at least 12 characters.",
  });
});

test("rejects email addresses without a domain", () => {
  expect(validateSignup({ ...valid, email: "maria@harbor" })).toHaveProperty("email");
  expect(validateSignup({ ...valid, email: "maria harbor@example.com" })).toHaveProperty("email");
});

test("login needs an email and a password", () => {
  expect(validateLogin({ email: valid.email, password: "x" })).toEqual({});
  expect(Object.keys(validateLogin({ email: "maria", password: "" }))).toEqual(["email", "password"]);
});

test("phone numbers are normalised to E.164 the way people paste them", () => {
  expect(toE164("+1 (415) 555-0142")).toBe("+14155550142");
  expect(toE164(" +44 20 7946 0958 ")).toBe("+442079460958");
  expect(isE164(toE164("+1 (415) 555-0142"))).toBe(true);
  // Without a +, there's no country code, so it stays invalid rather than guessing one.
  expect(isE164(toE164("415 555 0142"))).toBe(false);
});
