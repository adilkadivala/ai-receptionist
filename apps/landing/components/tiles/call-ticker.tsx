"use client";

import { motion, useTransform } from "motion/react";
import { incomingCalls } from "@/content/tiles";
import { useClock, useLoopProgress, usePlaying } from "@/lib/loop";

const loopMs = 7000;

/** Incoming calls scrolling up, each one already being answered. */
export function CallTicker() {
  const { ref, playing } = usePlaying<HTMLDivElement>();
  const progress = useLoopProgress(useClock(playing), loopMs);
  const y = useTransform(progress, (value) => `${-value * 50}%`);

  return (
    <div
      ref={ref}
      aria-hidden
      className="h-24 overflow-hidden text-xs [mask-image:linear-gradient(180deg,transparent,black_25%,black_75%,transparent)]"
    >
      {/* Drawn twice and moved by half its height; each row carries its own spacing so both halves match. */}
      <motion.div style={{ y }}>
        {[0, 1].flatMap((copy) =>
          incomingCalls.map((call) => (
            <div
              key={`${copy}-${call.number}`}
              className="mb-1.5 flex items-center justify-between gap-2 rounded-[9px] border px-2.5 py-[7px]"
            >
              <span dir="ltr" className="font-mono text-foreground/80">
                {call.number}
              </span>
              <span className="text-success-foreground">{call.state}</span>
            </div>
          )),
        )}
      </motion.div>
    </div>
  );
}
