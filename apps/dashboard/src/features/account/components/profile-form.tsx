import { Button } from "@receptionist/ui/components/button";
import { FieldGroup } from "@receptionist/ui/components/field";
import { Input } from "@receptionist/ui/components/input";
import { Spinner } from "@receptionist/ui/components/spinner";
import { toast } from "sonner";
import { FormField } from "../../../components/form-field";
import { SettingsCard } from "../../../components/settings-card";
import { useValidatedForm } from "../../../hooks/use-validated-form";
import { useUpdateProfile } from "../api";
import type { User } from "../types";
import { validateProfile } from "../validation";

/** The signed-in person's name and email. */
export function ProfileForm({ user }: { user: User }) {
  const update = useUpdateProfile();
  const form = useValidatedForm({ name: user.name, email: user.email }, validateProfile);
  const dirty = form.values.name !== user.name || form.values.email !== user.email;

  return (
    <SettingsCard title="Your profile" description="How the dashboard greets you, and where we send account email.">
      <form
        ref={form.formRef}
        noValidate
        onSubmit={form.handleSubmit((values) =>
          update.mutate(values, {
            onSuccess: (account) => {
              form.reset({ name: account.user.name, email: account.user.email });
              toast.success("Profile saved");
            },
            onError: () => toast.error("Couldn't save your profile. Try again."),
          }),
        )}
        className="flex flex-col gap-5"
      >
        <FieldGroup className="grid gap-4 sm:grid-cols-2">
          <FormField label="Name" error={form.errors.name}>
            {(control) => (
              <Input
                {...control}
                autoComplete="name"
                value={form.values.name}
                onChange={(event) => form.set("name", event.target.value)}
              />
            )}
          </FormField>
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
        </FieldGroup>
        <div className="flex justify-end">
          <Button type="submit" disabled={!dirty || update.isPending}>
            {update.isPending && <Spinner data-icon="inline-start" />}
            Save profile
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}
