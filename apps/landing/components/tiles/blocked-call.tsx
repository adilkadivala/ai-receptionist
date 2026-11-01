"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { ShieldX } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { screenedCalls } from "@/content/tiles";
import { ease, useSettled, useTicker, useTileInView } from "@/lib/motion";
import { OutcomePill } from "../outcome-pill";

// How many calls show at each step: they arrive one by one, the screen holds with all three, then clears.
const shownAt = [1, 2, 3, 3, 0];
const stepMs = [1400, 1400, 1500, 2600, 600];
const checkMs = 650;

/**
 * Calls are screened as they arrive: the first two are real and get through, the third is a robocall, struck out and
 * blocked before the AI picks up. The still frame shows all three, with the robocall blocked.
 */
export function BlockedCall() {
  const { ref, inView } = useTileInView<HTMLDivElement>();
  const startTick = 3;
  const tick = useTicker(inView, (current) => stepMs[current % stepMs.length] ?? 1400, startTick);
  const shown = shownAt[tick % shownAt.length] ?? 0;
  // Each pass through the loop gets its own keys, so the calls arrive afresh.
  const pass = Math.floor(tick / shownAt.length);

  return (
    <div ref={ref} aria-hidden className="h-[108px] text-xs">
      <ol className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {screenedCalls.slice(0, shown).map((call) => (
            <motion.li
              key={`${pass}-${call.number}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 0.45, ease: ease.enter }}
            >
              <ScreenedRow number={call.number} spam={call.spam} fresh={tick !== startTick} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>
    </div>
  );
}

/** A `fresh` call shows "Checking…" briefly, then gets through or is blocked. */
function ScreenedRow({ number, spam, fresh }: { number: string; spam: boolean; fresh: boolean }) {
  const checked = useSettled(checkMs, !fresh);
  const blocked = spam && checked;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded-[9px] px-2.5 py-[7px] transition-[background-color,box-shadow] duration-500",
        blocked ? "bg-muted shadow-(--tray)" : "bg-card shadow-(--raised)",
      )}
    >
      <span
        dir="ltr"
        className={cn(
          "relative font-mono transition-colors duration-500",
          blocked ? "text-muted-foreground" : "text-foreground/80",
        )}
      >
        {number}
        <motion.span
          initial={false}
          animate={{ scaleX: blocked ? 1 : 0 }}
          transition={{ duration: 0.4, ease: ease.move }}
          className="absolute inset-x-0 top-1/2 h-[1.5px] origin-left bg-foreground/70"
        />
      </span>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={checked ? (spam ? "blocked" : "through") : "checking"}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.25, ease: ease.enter }}
        >
          {!checked && <span className="text-muted-foreground">Checking…</span>}
          {checked && !spam && <span className="text-success-foreground">Answered</span>}
          {blocked && (
            <OutcomePill outcome="spam" className="gap-1 bg-border text-[11px] text-foreground/80">
              <ShieldX aria-hidden className="size-3" />
              Blocked
            </OutcomePill>
          )}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
