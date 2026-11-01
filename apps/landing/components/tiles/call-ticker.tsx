"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { incomingCalls } from "@/content/tiles";
import { ease, useSettled, useTicker, useTileInView } from "@/lib/motion";

const arrivalMs = 1800;
const ringMs = 700;
const visibleRows = 4;

/**
 * A live feed of calls: each new one arrives at the top, rings for a moment, is answered, and pushes the others down
 * and out at the bottom. Every row stays answered, so nobody waits on hold.
 */
export function CallTicker() {
  const { ref, inView } = useTileInView<HTMLDivElement>();
  const startTick = visibleRows;
  const tick = useTicker(inView, () => arrivalMs, startTick);
  // Newest first: the call that arrived on this tick, then the ones before it.
  const rows = Array.from({ length: visibleRows }, (_, offset) => tick - offset);

  return (
    <div
      ref={ref}
      aria-hidden
      className="h-[104px] overflow-hidden text-xs [mask-image:linear-gradient(180deg,black_70%,transparent)]"
    >
      <ol className="flex flex-col gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {rows.map((id) => {
            const call = incomingCalls[id % incomingCalls.length];
            if (!call) return null;
            return (
              <motion.li
                key={id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.6, ease: ease.move }}
              >
                <CallRow number={call.number} state={call.state} fresh={id > startTick} />
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

/** One call. A `fresh` call rings first, then shows what the receptionist is doing on it. */
function CallRow({ number, state, fresh }: { number: string; state: string; fresh: boolean }) {
  const answered = useSettled(ringMs, !fresh);
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-[9px] border px-2.5 py-[7px] transition-colors duration-500",
        answered ? "bg-card" : "border-primary/40 bg-brand-soft/60",
      )}
    >
      <span dir="ltr" className="font-mono text-foreground/80">
        {number}
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={answered ? "answered" : "ringing"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: ease.enter }}
          className={cn(
            "inline-flex items-center gap-1.5",
            answered ? "text-success-foreground" : "text-foreground/70",
          )}
        >
          {!answered && <span className="size-1.5 rounded-full bg-primary motion-safe:animate-pulse" />}
          {answered ? state : "Ringing…"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
