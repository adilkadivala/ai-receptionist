import { Badge } from "@receptionist/ui/components/badge";
import { TriangleAlert } from "lucide-react";
import { SettingsCard } from "../../../components/settings-card";
import { formatDate, formatPhone } from "../../../lib/format";
import { languageName } from "../format";
import type { AdminOrganizationDetail } from "../types";

/** A customer's numbers and which receptionist answers each, as the customer set them up. */
export function CustomerNumbers({ customer }: { customer: AdminOrganizationDetail }) {
  const agentName = (id: string | null) => customer.agents.find((agent) => agent.id === id)?.name;

  return (
    <SettingsCard
      title="Phone numbers"
      description={
        customer.phone_numbers.length === 0
          ? "No numbers yet, so nobody can call this customer's receptionist."
          : "What callers dial, and who answers."
      }
    >
      {customer.phone_numbers.length > 0 && (
        <ul className="flex flex-col divide-y divide-border/70">
          {customer.phone_numbers.map((number) => (
            <li
              key={number.id}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5 first:pt-0 last:pb-0"
            >
              <span className="font-mono font-medium tabular-nums">{formatPhone(number.e164)}</span>
              {number.agent_id ? (
                <span className="text-[13px] text-foreground/80">
                  Answered by {agentName(number.agent_id) ?? "a receptionist"}
                </span>
              ) : (
                <Badge
                  variant="outline"
                  className="h-6 gap-1.5 border-transparent bg-warning-soft px-2.5 text-warning-foreground"
                >
                  <TriangleAlert data-icon="inline-start" />
                  Not answered
                </Badge>
              )}
              <span className="w-full text-xs text-muted-foreground">
                {number.provider === "telnyx" ? "Telnyx" : number.provider} · added {formatDate(number.created_at)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}

/** A customer's receptionists: the languages each expects, where it transfers to, and whether the greeting is custom. */
export function CustomerAgents({ customer }: { customer: AdminOrganizationDetail }) {
  return (
    <SettingsCard
      title="Receptionists"
      description={
        customer.agents.length === 0 ? "No receptionist set up yet." : "Each receptionist this customer set up."
      }
    >
      {customer.agents.length > 0 && (
        <ul className="flex flex-col divide-y divide-border/70">
          {customer.agents.map((agent) => (
            <li key={agent.id} className="flex flex-col gap-1.5 py-2.5 first:pt-0 last:pb-0">
              <span className="font-medium">{agent.name}</span>
              <span className="flex flex-wrap gap-1.5">
                {agent.languages.map((code) => (
                  <Badge key={code} variant="secondary" className="h-5 px-2 text-[11px]">
                    {languageName(code)}
                  </Badge>
                ))}
              </span>
              <span className="text-xs text-muted-foreground">
                {agent.greeting ? "Own greeting" : "Default greeting"} ·{" "}
                {agent.transfer_number ? (
                  <>
                    transfers to <span className="font-mono tabular-nums">{formatPhone(agent.transfer_number)}</span>
                  </>
                ) : (
                  "no transfer number"
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </SettingsCard>
  );
}
