import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { Mail, PhoneIncoming } from "lucide-react";
import { exampleCall } from "@/content/transcripts";
import { Transcript } from "./transcript";

/** The hero's product artifact: one example call, from greeting to booking, and the summary the owner gets. */
export function ExampleCall({ className }: { className?: string }) {
  return (
    <figure
      aria-label={`Example call to ${exampleCall.business}`}
      className={cn(
        "overflow-hidden rounded-xl bg-card text-card-foreground shadow-sm ring-1 ring-foreground/10",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="size-2.5 shrink-0 rounded-full bg-primary ring-4 ring-primary/15" aria-hidden />
          <PhoneIncoming className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="truncate text-sm font-medium">{exampleCall.business}</p>
          <p className="hidden font-mono text-xs text-muted-foreground sm:block">{exampleCall.receivedAt}</p>
        </div>
        <Badge variant="outline">Example</Badge>
      </div>

      <Transcript turns={exampleCall.turns} animate className="p-4 sm:p-5" />

      <figcaption className="border-t bg-muted/50 px-4 py-4 sm:px-5">
        <p className="flex items-center gap-2 font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
          <Mail className="size-3.5" aria-hidden />
          Summary emailed to the owner
        </p>
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-sm">
          {exampleCall.summary.map((row) => (
            <div key={row.label} className="contents">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}
