"use client";

import { easeInOut, motion, useTransform } from "motion/react";
import { bookingSlots } from "@/content/tiles";
import { useClock, useLoopProgress, usePlaying } from "@/lib/loop";

const loopMs = 4500;
// Hidden, then it slides in, stays, and fades before the next booking.
const at = [0, 0.12, 0.24, 0.86, 1];

/** A day in the calendar; the new booking slides into the free 10:00 slot. */
export function BookingSlots() {
  const { ref, playing } = usePlaying<HTMLDivElement>();
  const progress = useLoopProgress(useClock(playing, loopMs * 0.5), loopMs);
  const opacity = useTransform(progress, at, [0, 0, 1, 1, 0], { ease: easeInOut });
  const y = useTransform(progress, at, [10, 10, 0, 0, 0], { ease: easeInOut });
  const scale = useTransform(progress, at, [0.97, 0.97, 1, 1, 1], { ease: easeInOut });
  const { before, booked, after } = bookingSlots;

  return (
    <div ref={ref} className="flex flex-col gap-1.5 text-xs">
      <div className="flex items-center gap-2.5 rounded-lg bg-muted/60 px-2.5 py-[9px]">
        <span className="font-mono text-muted-foreground">{before.time}</span>
        <span className="text-foreground/80">{before.label}</span>
      </div>
      <motion.div
        style={{ opacity, y, scale }}
        className="flex items-center justify-between gap-2.5 rounded-lg border border-primary bg-brand-soft px-2.5 py-[9px] text-brand-soft-foreground"
      >
        <span className="flex gap-2.5">
          <span className="font-mono">{booked.time}</span>
          <span className="font-medium">{booked.label}</span>
        </span>
        <span className="text-[11px]">{booked.tag}</span>
      </motion.div>
      <div className="flex items-center gap-2.5 rounded-lg border border-dashed px-2.5 py-[9px] text-muted-foreground">
        <span className="font-mono">{after.time}</span>
        <span>{after.label}</span>
      </div>
    </div>
  );
}
