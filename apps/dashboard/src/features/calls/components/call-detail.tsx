import { formatUsd } from "@receptionist/product";
import { Eyebrow } from "@receptionist/ui/blocks/drafting";
import { buttonVariants } from "@receptionist/ui/components/button";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { PhoneOutgoing } from "lucide-react";
import type { ReactNode } from "react";
import { resting } from "../../../components/surfaces";
import { formatDuration, formatPhone } from "../../../lib/format";
import { billedMinutes } from "../../../lib/usage";
import type { Call } from "../types";
import { OutcomeBadge } from "./outcome-badge";
import { Transcript } from "./transcript";

function Fact({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 bg-card px-3.5 py-3">
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
          <a
            href={`tel:${call.from_number}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), resting)}
          >
            <PhoneOutgoing data-icon="inline-start" />
            Call back
          </a>
        )}
      </div>

      {/* The facts as cells split by hairlines, like the landing page's grid. */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] bg-border shadow-(--raised) sm:grid-cols-3">
        <Fact label="Length">{formatDuration(call.duration_seconds)}</Fact>
        <Fact label="Minutes counted">{minutes}</Fact>
        <Fact label="Language">{call.language ?? "—"}</Fact>
        <Fact label="Caller's number">{formatPhone(call.from_number)}</Fact>
        <Fact label="Number dialed">{formatPhone(call.to_number)}</Fact>
        <Fact label="Call cost">{call.cost_usd === null ? "—" : formatUsd(call.cost_usd)}</Fact>
      </dl>

      <section aria-labelledby="call-summary" className="flex flex-col gap-2">
        <Eyebrow as="h3" id="call-summary">
          Summary
        </Eyebrow>
        <p className="text-[15px]/relaxed text-pretty">{call.summary ?? "The summary is still being written."}</p>
      </section>

      <section aria-labelledby="call-transcript" className="flex flex-col gap-3">
        <Eyebrow as="h3" id="call-transcript">
          Transcript
        </Eyebrow>
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
