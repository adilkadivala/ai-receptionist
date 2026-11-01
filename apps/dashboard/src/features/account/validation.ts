import { check, type Errors, isEmail } from "../../lib/validation";
import type { LoginInput, ProfileInput, SignupInput } from "./types";

export const minPasswordLength = 12;

export function validateSignup(input: SignupInput): Errors {
  const errors: Errors = {};
  check(errors, "name", !input.name.trim(), "Enter your name.");
  check(errors, "business_name", !input.business_name.trim(), "Enter your business's name.");
  check(errors, "email", !input.email.trim(), "Enter your email address.");
  check(errors, "email", !isEmail(input.email), "Enter an email address like name@business.com.");
  check(errors, "password", input.password.length < minPasswordLength, `Use at least ${minPasswordLength} characters.`);
  return errors;
}

export function validateLogin(input: LoginInput): Errors {
  const errors: Errors = {};
  check(errors, "email", !isEmail(input.email), "Enter the email address you signed up with.");
  check(errors, "password", !input.password, "Enter your password.");
  return errors;
}

export function validateProfile(input: ProfileInput): Errors {
  const errors: Errors = {};
  check(errors, "name", !input.name.trim(), "Enter your name.");
  check(errors, "email", !isEmail(input.email), "Enter an email address like name@business.com.");
  return errors;
}
