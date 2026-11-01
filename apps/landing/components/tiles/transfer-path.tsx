"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { Bot } from "lucide-react";
import { easeInOut, type MotionValue, motion, useTransform } from "motion/react";
import { useClock, useLoopProgress, usePlaying } from "@/lib/loop";

const loopMs = 2400;

/** Caller → AI → you: a dot travels each leg, the second half a loop behind the first. */
export function TransferPath() {
  const { ref, playing } = usePlaying<HTMLDivElement>();
  // Start three quarters in, so the still frame shows a dot on each leg.
  const clock = useClock(playing, loopMs * 0.75);

  return (
    <div ref={ref} className="flex items-center gap-2">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold text-foreground/80">
        Caller
      </span>
      <Leg clock={clock} delayMs={0} dotClassName="bg-primary" />
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground">
        <Bot aria-label="AI receptionist" className="size-4" />
      </span>
      <Leg clock={clock} delayMs={loopMs / 2} dotClassName="bg-success" />
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-success-soft text-[11px] font-semibold text-success-foreground">
        You
      </span>
    </div>
  );
}

function Leg({ clock, delayMs, dotClassName }: { clock: MotionValue<number>; delayMs: number; dotClassName: string }) {
  const progress = useLoopProgress(clock, loopMs, delayMs);
  const x = useTransform(progress, [0, 1], ["0%", "100%"], { ease: easeInOut });
  const opacity = useTransform(progress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // The leg is drawn left to right and mirrored as a whole for right-to-left pages.
  return (
    <span
      aria-hidden
      className="relative h-0.5 flex-1 bg-[repeating-linear-gradient(90deg,var(--border)_0_6px,transparent_6px_10px)] rtl:-scale-x-100"
    >
      <span className="absolute inset-y-0 right-2.5 left-0">
        <motion.span style={{ x, opacity }} className="absolute inset-0">
          <span className={cn("absolute -top-1 left-0 size-2.5 rounded-full", dotClassName)} />
        </motion.span>
      </span>
    </span>
  );
}
