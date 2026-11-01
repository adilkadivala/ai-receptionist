import { Skeleton } from "@receptionist/ui/components/skeleton";
import { AppearanceSettings } from "../components/appearance-settings";
import { PageHeader } from "../components/page-header";
import { QueryError } from "../components/query-error";
import { SettingsCard } from "../components/settings-card";
import { useAccount } from "../features/account/api";
import { ProfileForm } from "../features/account/components/profile-form";
import { regions } from "../features/account/regions";

export function SettingsPage() {
  const account = useAccount();
  const region = regions.find((option) => option.id === account.data?.organization.region);

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      <PageHeader>Your profile, how the dashboard looks, and where your business's data lives.</PageHeader>
      {account.isError && <QueryError title="Couldn't load your account" onRetry={() => account.refetch()} />}
      {account.isPending && <Skeleton className="h-48 rounded-[16px]" />}
      {account.data && <ProfileForm user={account.data.user} />}
      <AppearanceSettings />
      {account.data && (
        <SettingsCard
          title="Data region"
          description="Where your calls, recordings and transcripts are stored. It's chosen when the account is created."
        >
          <p className="font-medium">{region?.label ?? account.data.organization.region}</p>
        </SettingsCard>
      )}
    </div>
  );
}
