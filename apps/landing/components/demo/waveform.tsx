"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { easeInOut, type MotionValue, motion, useTransform } from "motion/react";
import { useClock } from "@/lib/loop";

// 40 bars of fixed heights, each rising and falling at its own pace (values from the design's waveBars).
const bars = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  height: 18 + Math.round(46 * Math.abs(Math.sin(index * 0.55) * Math.cos(index * 0.17 + 0.4))),
  periodMs: 700 + ((index * 137) % 600),
  offsetMs: (index * 83) % 900,
}));

const tones = {
  ai: "bg-primary",
  caller: "bg-muted-foreground/60",
  idle: "bg-muted-foreground/25",
};

export type WaveTone = keyof typeof tones;

// One beat: 25% → 100% → 25% of the bar's height, eased in and out.
function level(phase: number): number {
  const position = phase % 1;
  const rise = position < 0.5 ? position * 2 : (1 - position) * 2;
  return 0.25 + 0.75 * easeInOut(rise);
}

/** A voice wave: blue while the receptionist speaks, grey for the caller, frozen in place when `playing` stops. */
export function Waveform({ tone, playing }: { tone: WaveTone; playing: boolean }) {
  const clock = useClock(playing);
  return (
    <div aria-hidden className="flex h-16 items-center justify-center gap-[3px]">
      {bars.map((bar) => (
        <Bar key={bar.id} clock={clock} {...bar} className={tones[tone]} />
      ))}
    </div>
  );
}

function Bar({
  clock,
  height,
  periodMs,
  offsetMs,
  className,
}: {
  clock: MotionValue<number>;
  height: number;
  periodMs: number;
  offsetMs: number;
  className: string;
}) {
  const scaleY = useTransform(clock, (time) => level((time + offsetMs) / periodMs));
  return (
    <motion.span
      style={{ height, scaleY }}
      className={cn("block w-1 shrink-0 rounded-full transition-colors duration-300", className)}
    />
  );
}
