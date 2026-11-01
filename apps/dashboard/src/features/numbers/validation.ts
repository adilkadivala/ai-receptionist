import { check, type Errors } from "../../lib/validation";
import type { AddNumberInput } from "./types";

export function validateAddNumber(input: AddNumberInput): Errors {
  const errors: Errors = {};
  check(errors, "country", !input.country, "Choose a country.");
  check(errors, "area_code", !/^\d{0,5}$/.test(input.area_code), "Use digits only, up to 5.");
  check(errors, "label", input.label.length > 50, "Use 50 characters or fewer.");
  return errors;
}
