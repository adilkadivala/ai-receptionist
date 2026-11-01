"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { type MotionValue, motion, steps, useMotionTemplate, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { summaryEmail } from "@/content/tiles";
import { useClock, useLoopProgress, usePlaying } from "@/lib/loop";

const loopMs = 6000;

/** The summary email, typing itself out line by line, then clearing for the next call. */
export function TypingSummary() {
  const { ref, playing } = usePlaying<HTMLDivElement>();
  // Start halfway, when every line is written out.
  const clock = useClock(playing, loopMs * 0.5);

  return (
    <div ref={ref} className="flex flex-col gap-2 rounded-[12px] border bg-muted/25 p-3.5 text-xs">
      <div className="flex justify-between gap-2 text-muted-foreground">
        <span>{summaryEmail.from}</span>
        <span className="font-mono">{summaryEmail.time}</span>
      </div>
      <TypedLine clock={clock} delayMs={0} keystrokes={28} className="text-[13px] font-semibold">
        {summaryEmail.subject}
      </TypedLine>
      {summaryEmail.lines.map((line, index) => (
        <TypedLine key={line} clock={clock} delayMs={(index + 1) * 500} keystrokes={36} className="text-foreground/80">
          {line}
        </TypedLine>
      ))}
    </div>
  );
}

function TypedLine({
  clock,
  delayMs,
  keystrokes,
  className,
  children,
}: {
  clock: MotionValue<number>;
  delayMs: number;
  /** How many jumps the reveal takes, so it reads as typing rather than a wipe. */
  keystrokes: number;
  className?: string;
  children: ReactNode;
}) {
  const progress = useLoopProgress(clock, loopMs, delayMs);
  const ease = steps(keystrokes);
  const hidden = useTransform(progress, [0, 0.08, 0.3, 0.88, 1], [100, 100, 0, 0, 0], { ease });
  const opacity = useTransform(progress, [0, 0.88, 1], [1, 1, 0], { ease });
  const clipPath = useMotionTemplate`inset(0 ${hidden}% 0 0)`;

  return (
    <motion.span style={{ clipPath, opacity }} className={cn("block", className)}>
      {children}
    </motion.span>
  );
}
