import { cn } from "@receptionist/ui/lib/utils";
import type { TranscriptTurn } from "@/content/transcripts";
import { brandText } from "./section";

const speakers = { ai: "AI receptionist", caller: "Caller" } as const;

/**
 * A call written out line by line. With `animate`, the lines appear one after another
 * (ease-out, staggered) so the call reads as it happened; skipped under reduced motion.
 */
export function Transcript({
  turns,
  animate,
  className,
}: {
  turns: readonly TranscriptTurn[];
  animate?: boolean;
  className?: string;
}) {
  return (
    <ol className={cn("space-y-4", className)}>
      {turns.map((turn, index) => (
        <li
          key={turn.text}
          className={cn(
            "grid gap-x-3",
            turn.at ? "grid-cols-[2.75rem_minmax(0,1fr)]" : "grid-cols-1",
            animate &&
              "fill-mode-backwards duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2",
          )}
          style={animate ? { animationDelay: `${200 + index * 140}ms` } : undefined}
        >
          {turn.at && (
            <span className="pt-0.5 font-mono text-xs text-muted-foreground tabular-nums">
              <span className="sr-only">At </span>
              {turn.at}
            </span>
          )}
          <div className="min-w-0">
            <p className={cn("text-xs font-medium", turn.speaker === "ai" ? brandText : "text-muted-foreground")}>
              {speakers[turn.speaker]}
            </p>
            <p lang={turn.lang} className="mt-0.5 text-sm/6">
              {turn.text}
            </p>
            {turn.translation && <p className="mt-1 text-xs text-muted-foreground italic">{turn.translation}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
