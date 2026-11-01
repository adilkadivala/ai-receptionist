import { type FormEvent, useRef, useState } from "react";
import { type Errors, isEmpty } from "../lib/validation";

/**
 * Form state with validation on submit. Errors appear after the first submit, then update as the user types,
 * and the first invalid field gets focus. `onInvalid` runs first, e.g. to switch to the tab that holds it.
 */
export function useValidatedForm<T>(initial: T, validate: (values: T) => Errors) {
  const [values, setValues] = useState(initial);
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const errors = submitted ? validate(values) : {};

  function set<K extends keyof T>(key: K, value: T[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(onValid: (values: T) => void, onInvalid?: (errors: Errors) => void) {
    return (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitted(true);
      const found = validate(values);
      if (isEmpty(found)) {
        onValid(values);
        return;
      }
      onInvalid?.(found);
      // After React renders the errors (and any tab switch), move focus to the first one.
      requestAnimationFrame(() => {
        formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      });
    };
  }

  function reset(next: T = initial) {
    setValues(next);
    setSubmitted(false);
  }

  return { values, setValues, set, errors, handleSubmit, reset, formRef };
}
