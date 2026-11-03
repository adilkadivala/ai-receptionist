import { formatUsd } from "@receptionist/product";
import { Eyebrow } from "@receptionist/ui/blocks/drafting";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { ScrollText } from "lucide-react";
import type { ReactNode } from "react";
import { formatDateTime, formatDuration, formatPhone } from "../../../lib/format";
import { OutcomeBadge } from "../../calls/components/outcome-badge";
import { Transcript } from "../../calls/components/transcript";
import type { TranscriptTurn } from "../../calls/types";
import { knownOutcome, languageName, readSummary } from "../format";
import type { AdminCall, CallSummary } from "../types";

function Fact({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1 bg-card px-3.5 py-3", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{children}</dd>
    </div>
  );
}

/** Claude's summary, as the owner's email has it: the headline, who called, what they need, and what to do next. */
function Summary({ summary }: { summary: CallSummary }) {
  const rows: [string, string | undefined][] = [
    ["Caller", summary.caller_name],
    ["Number they gave", summary.phone_number],
    ["What they need", summary.need],
  ];

  return (
    <section aria-labelledby="admin-call-summary" className="flex flex-col gap-3">
      <Eyebrow as="h3" id="admin-call-summary">
        Summary
      </Eyebrow>
      {summary.headline && (
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-pretty">{summary.headline}</p>
      )}
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(
          ([label, value]) =>
            value && (
              <div key={label} className="contents">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-pretty">{value}</dd>
              </div>
            ),
        )}
        {summary.urgency && (
          <div className="contents">
            <dt className="text-muted-foreground">Urgency</dt>
            {/* Plain text: status colours are kept for call outcomes (DESIGN.md). */}
            <dd className="capitalize">{summary.urgency}</dd>
          </div>
        )}
      </dl>
      {summary.next_steps && summary.next_steps.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-sm text-muted-foreground">Next steps</p>
          <ol className="flex list-decimal flex-col gap-1 ps-5 text-sm marker:text-muted-foreground">
            {summary.next_steps.map((step) => (
              <li key={step} className="text-pretty">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}

/** Everything about one call: how it ended, the facts, the summary once there is one, and the whole transcript. */
export function AdminCallDetail({ call, customerName }: { call: AdminCall; customerName?: string }) {
  const summary = readSummary(call.summary);
  const turns: TranscriptTurn[] = call.transcript.map((turn) => ({
    role: turn.role === "ai" ? "ai" : "caller",
    text: turn.text,
  }));

  return (
    <div className="flex flex-col gap-5">
      <OutcomeBadge
        outcome={knownOutcome(call.outcome)}
        emptyLabel={call.outcome ?? "No outcome"}
        className="self-start"
      />

      {/* The facts as cells split by hairlines, like the customer's call sheet. */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[14px] bg-border shadow-(--raised) sm:grid-cols-3">
        <Fact label="From">{formatPhone(call.from_number)}</Fact>
        <Fact label="To">{formatPhone(call.to_number)}</Fact>
        <Fact label="Language">{languageName(call.language)}</Fact>
        <Fact label="Started">{formatDateTime(call.started_at)}</Fact>
        <Fact label="Ended">{call.ended_at ? formatDateTime(call.ended_at) : "—"}</Fact>
        <Fact label="Length">{formatDuration(call.duration_seconds)}</Fact>
        <Fact label="Answered by">{call.agent_name ?? "—"}</Fact>
        <Fact label="Call cost">{call.cost_usd === null ? "—" : formatUsd(call.cost_usd)}</Fact>
        {/* Nine cells: on two columns the last one spans both, so no empty cell shows. */}
        <Fact label="Call ID" className="max-sm:col-span-2">
          <span title={call.id} className="font-mono text-[13px] font-normal">
            {call.id.slice(0, 8)}
          </span>
        </Fact>
      </dl>

      {summary && <Summary summary={summary} />}

      <section aria-labelledby="admin-call-transcript" className="flex flex-col gap-3">
        <Eyebrow as="h3" id="admin-call-transcript">
          Transcript
        </Eyebrow>
        <Transcript turns={turns} />
      </section>

      <p className="flex items-start gap-2 border-t border-border/70 pt-4 text-xs text-muted-foreground">
        <ScrollText aria-hidden className="mt-px size-3.5 shrink-0" />
        Opening this call was recorded in {customerName ? `${customerName}'s` : "the customer's"} audit log.
      </p>
    </div>
  );
}

export function AdminCallDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-busy="true">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="h-40 rounded-[14px]" />
      <Skeleton className="h-24" />
      <Skeleton className="h-48" />
    </div>
  );
}
