import { Field, FieldDescription, FieldError, FieldLabel } from "@receptionist/ui/components/field";
import { type ReactNode, useId } from "react";

export type ControlProps = {
  id: string;
  "aria-invalid": true | undefined;
  "aria-describedby": string | undefined;
};

/**
 * A labelled control with its hint and error. `children` receives the id and aria attributes to spread on the
 * input, so the label, hint and error are always wired to it.
 */
export function FormField({
  label,
  description,
  error,
  className,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  className?: string;
  children: (control: ControlProps) => ReactNode;
}) {
  const id = useId();
  const describedBy = [description && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ");

  return (
    <Field data-invalid={error ? true : undefined} className={className}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children({ id, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy || undefined })}
      {description && <FieldDescription id={`${id}-hint`}>{description}</FieldDescription>}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </Field>
  );
}
