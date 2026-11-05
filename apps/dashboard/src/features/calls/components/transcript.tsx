import { cn } from "@receptionist/ui/lib/utils";
import { formatDuration } from "../../../lib/format";
import type { TranscriptTurn } from "../types";

/**
 * The call turn by turn, as the landing page's call demo draws it: the receptionist's lines in grey from the start,
 * the caller's in blue from the end. Each turn sets its own direction, so Arabic or Hebrew reads right to left.
 */
export function Transcript({ turns }: { turns: readonly TranscriptTurn[] }) {
  if (turns.length === 0) {
    return <p className="text-muted-foreground">No transcript: nobody spoke on this call.</p>;
  }

  return (
    <ol className="flex flex-col gap-3">
      {turns.map((turn, index) => {
        const ai = turn.role === "ai";
        return (
          <li
            // biome-ignore lint/suspicious/noArrayIndexKey: turns never reorder and have no id
            key={index}
            className={cn("flex max-w-[85%] flex-col gap-1", ai ? "items-start self-start" : "items-end self-end")}
          >
            <div className="flex items-baseline gap-2 px-1 text-xs text-muted-foreground">
              <span className="font-medium">{ai ? "Receptionist" : "Caller"}</span>
              {turn.at_seconds !== undefined && (
                <time className="font-mono tabular-nums">{formatDuration(turn.at_seconds)}</time>
              )}
            </div>
            <p
              dir="auto"
              className={cn(
                "rounded-[14px] px-3.5 py-2.5 text-pretty",
                ai ? "rounded-es-[4px] bg-muted" : "rounded-ee-[4px] bg-primary text-primary-foreground",
              )}
            >
              {turn.text}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
