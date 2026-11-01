import { cn } from "@receptionist/ui/lib/utils";
import { formatDuration } from "../../../lib/format";
import type { TranscriptTurn } from "../types";

/** The call turn by turn. Each turn sets its own direction, so Arabic or Hebrew reads right to left. */
export function Transcript({ turns }: { turns: readonly TranscriptTurn[] }) {
  if (turns.length === 0) {
    return <p className="text-muted-foreground">No transcript: nobody spoke on this call.</p>;
  }

  return (
    <ol className="flex flex-col gap-2">
      {turns.map((turn, index) => (
        <li
          // biome-ignore lint/suspicious/noArrayIndexKey: turns never reorder and have no id
          key={index}
          className={cn("flex flex-col gap-1 rounded-lg px-3 py-2", turn.role === "ai" ? "bg-primary/5" : "bg-muted")}
        >
          <div className="flex items-baseline justify-between gap-2 text-xs text-muted-foreground">
            <span className={cn("font-medium", turn.role === "ai" && "text-primary")}>
              {turn.role === "ai" ? "Receptionist" : "Caller"}
            </span>
            <time className="tabular-nums">{formatDuration(turn.at_seconds)}</time>
          </div>
          <p dir="auto" className="text-pretty">
            {turn.text}
          </p>
        </li>
      ))}
    </ol>
  );
}
