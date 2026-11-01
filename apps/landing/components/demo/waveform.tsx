"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { cancelFrame, easeInOut, type FrameData, frame, type MotionValue, motion, motionValue } from "motion/react";
import { useEffect, useMemo } from "react";

// 40 bars of fixed heights, each rising and falling at its own pace (values from the design's waveBars).
const bars = Array.from({ length: 40 }, (_, index) => ({
  id: index,
  height: 18 + Math.round(46 * Math.abs(Math.sin(index * 0.55) * Math.cos(index * 0.17 + 0.4))),
  periodMs: 700 + ((index * 137) % 600),
  offsetMs: (index * 83) % 900,
  // With real audio, the middle bars show the voice's low frequencies and the outer bars its higher ones.
  bin: 2 + Math.round((Math.abs(index - 19.5) / 20) * 22),
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

/**
 * A voice wave: blue while the receptionist speaks, grey for the caller, frozen in place when `playing` stops. Given
 * an `analyser`, the bars follow the real sound; otherwise each bar rises and falls on its own.
 */
export function Waveform({
  tone,
  playing,
  analyser,
}: {
  tone: WaveTone;
  playing: boolean;
  analyser?: AnalyserNode | null;
}) {
  // One value per bar, set straight from the animation frame, so the 40 bars never re-render React.
  const levels = useMemo(() => bars.map((bar) => motionValue(level(bar.offsetMs / bar.periodMs))), []);

  useEffect(() => {
    if (!playing) return;
    const spectrum = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let time = 0;
    const tick = ({ delta }: FrameData) => {
      time += delta;
      if (analyser && spectrum) {
        analyser.getByteFrequencyData(spectrum);
        for (const [index, bar] of bars.entries()) levels[index]?.set(0.1 + 0.9 * ((spectrum[bar.bin] ?? 0) / 255));
      } else {
        for (const [index, bar] of bars.entries()) levels[index]?.set(level((time + bar.offsetMs) / bar.periodMs));
      }
    };
    frame.update(tick, true);
    return () => cancelFrame(tick);
  }, [playing, analyser, levels]);

  return (
    <div aria-hidden className="flex h-16 items-center justify-center gap-[3px]">
      {bars.map((bar, index) => (
        <Bar key={bar.id} height={bar.height} scaleY={levels[index]} className={tones[tone]} />
      ))}
    </div>
  );
}

function Bar({ height, scaleY, className }: { height: number; scaleY?: MotionValue<number>; className: string }) {
  return (
    <motion.span
      style={{ height, scaleY }}
      className={cn("block w-1 shrink-0 rounded-full transition-colors duration-300", className)}
    />
  );
}
