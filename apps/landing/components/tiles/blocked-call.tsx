"use client";

import { easeInOut, motion, useTransform } from "motion/react";
import { blockedNumber } from "@/content/tiles";
import { useClock, useLoopProgress, usePlaying } from "@/lib/loop";
import { OutcomePill } from "../outcome-pill";

const loopMs = 4000;

/** A robocall's number is struck through, then marked "Blocked". */
export function BlockedCall() {
  const { ref, playing } = usePlaying<HTMLDivElement>();
  // Start where the number is struck through and the label is showing.
  const progress = useLoopProgress(useClock(playing, loopMs * 0.6), loopMs);
  const strike = useTransform(progress, [0, 0.2, 0.45, 0.85, 1], [0, 0, 1, 1, 1], { ease: easeInOut });
  const strikeOpacity = useTransform(progress, [0, 0.85, 1], [1, 1, 0], { ease: easeInOut });
  const labelOpacity = useTransform(progress, [0, 0.4, 0.55, 0.85, 1], [0, 0, 1, 1, 0], { ease: easeInOut });

  return (
    <div ref={ref} className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 p-2.5 text-xs">
      <span dir="ltr" className="relative font-mono text-foreground/80">
        {blockedNumber}
        <motion.span
          aria-hidden
          style={{ scaleX: strike, opacity: strikeOpacity }}
          className="absolute inset-x-0 top-1/2 h-[1.5px] origin-left bg-foreground/80"
        />
      </span>
      <motion.span style={{ opacity: labelOpacity }}>
        <OutcomePill outcome="spam" className="bg-border text-[11px] text-foreground/80">
          Blocked
        </OutcomePill>
      </motion.span>
    </div>
  );
}
