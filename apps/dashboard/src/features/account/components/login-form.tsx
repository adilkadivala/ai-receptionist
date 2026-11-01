import { Button } from "@receptionist/ui/components/button";
import { FieldGroup } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Spinner } from "@receptionist/ui/components/spinner";
import { FormField } from "../../../components/form-field";
import { useValidatedForm } from "../../../hooks/use-validated-form";
import { useLogin } from "../api";
import { validateLogin } from "../validation";
import { SubmitError } from "./submit-error";

export function LoginForm() {
  const login = useLogin();
  const form = useValidatedForm({ email: "", password: "" }, validateLogin);

  return (
    <form
      ref={form.formRef}
      noValidate
      onSubmit={form.handleSubmit((values) => login.mutate(values))}
      className="flex flex-col gap-6"
    >
      <FieldGroup className="gap-4">
        <FormField label="Email" error={form.errors.email}>
          {(control) => (
            <Input
              {...control}
              type="email"
              autoComplete="email"
              value={form.values.email}
              onChange={(event) => form.set("email", event.target.value)}
            />
          )}
        </FormField>
        <FormField label="Password" error={form.errors.password}>
          {(control) => (
            <Input
              {...control}
              type="password"
              autoComplete="current-password"
              value={form.values.password}
              onChange={(event) => form.set("password", event.target.value)}
            />
          )}
        </FormField>
      </FieldGroup>

      {login.error && <SubmitError error={login.error} />}

      <Button type="submit" size="lg" disabled={login.isPending}>
        {login.isPending && <Spinner data-icon="inline-start" />}
        Log in
      </Button>
    </form>
  );
}
