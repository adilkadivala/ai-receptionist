import { Skeleton } from "@receptionist/ui/components/skeleton";
import { PageHeader } from "../components/page-header";
import { QueryError } from "../components/query-error";
import { useAgentConfig, useAgents } from "../features/receptionist/api";
import { ReceptionistForm } from "../features/receptionist/components/receptionist-form";

export function ReceptionistPage() {
  const agents = useAgents();
  // One receptionist per business for now; several (per branch or department) come with locations.
  const agent = agents.data?.[0];
  const config = useAgentConfig(agent?.id);

  return (
    <div className="flex flex-1 flex-col">
      <PageHeader>What it says, what it knows, which languages it expects and who it transfers to.</PageHeader>
      {(agents.isError || config.isError) && (
        <QueryError
          title="Couldn't load your receptionist"
          onRetry={() => (agents.isError ? agents : config).refetch()}
        />
      )}
      {config.data ? (
        <ReceptionistForm key={config.data.agent_id} config={config.data} />
      ) : (
        !agents.isError && !config.isError && <Skeleton className="h-96 rounded-[16px]" />
      )}
    </div>
  );
}
