import { formatUsd } from "@receptionist/product";
import { buttonVariants } from "@receptionist/ui/components/button";
import { Separator } from "@receptionist/ui/components/separator";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { PhoneOutgoing } from "lucide-react";
import type { ReactNode } from "react";
import { formatDuration, formatPhone } from "../../../lib/format";
import { billedMinutes } from "../../../lib/usage";
import type { Call } from "../types";
import { OutcomeBadge } from "./outcome-badge";
import { Transcript } from "./transcript";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{children}</dd>
    </div>
  );
}

/** Everything about one call: outcome, the facts, the summary and the transcript. */
export function CallDetail({ call }: { call: Call }) {
  const minutes = billedMinutes(call.duration_seconds);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <OutcomeBadge outcome={call.outcome} />
        {call.from_number && (
          <a href={`tel:${call.from_number}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <PhoneOutgoing data-icon="inline-start" />
            Call back
          </a>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
        <Fact label="Length">{formatDuration(call.duration_seconds)}</Fact>
        <Fact label="Minutes counted">{minutes}</Fact>
        <Fact label="Language">{call.language ?? "—"}</Fact>
        <Fact label="Caller's number">{formatPhone(call.from_number)}</Fact>
        <Fact label="Number dialed">{formatPhone(call.to_number)}</Fact>
        <Fact label="Call cost">{call.cost_usd === null ? "—" : formatUsd(call.cost_usd)}</Fact>
      </dl>

      <Separator />

      <section aria-labelledby="call-summary" className="flex flex-col gap-1.5">
        <h3 id="call-summary" className="font-heading font-medium">
          Summary
        </h3>
        <p className="text-pretty">{call.summary ?? "The summary is still being written."}</p>
      </section>

      <section aria-labelledby="call-transcript" className="flex flex-col gap-2">
        <h3 id="call-transcript" className="font-heading font-medium">
          Transcript
        </h3>
        <Transcript turns={call.transcript} />
      </section>
    </div>
  );
}

export function CallDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-5 w-28" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {["length", "minutes", "language", "from", "to", "cost"].map((key) => (
          <Skeleton key={key} className="h-9" />
        ))}
      </div>
      <Skeleton className="h-16" />
      <Skeleton className="h-40" />
    </div>
  );
}
