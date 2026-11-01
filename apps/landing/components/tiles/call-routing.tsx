"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { Bot, Check, PhoneForwarded, PhoneIncoming, Siren } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { routedCalls } from "@/content/tiles";
import { ease, useTicker, useTileInView } from "@/lib/motion";

const cycleMs = 2800;
const arriveMs = 1400;
// Today's counts before the loop starts, so the tile looks like a day in progress. They start over every few loops,
// so a visitor who stays a while doesn't see them climb into the hundreds.
const base = { you: 2, handled: 9 };
const countsResetAfter = routedCalls.length * 4;
const urgentPerCycle = routedCalls.filter((call) => call.urgent).length;

// The diagram is drawn on a fixed 232 × 156 box, centred in the tile: the incoming call at the top, the receptionist
// in the middle, then two branches down to you (urgent) and back to the receptionist's own handling (everything else).
const inbound = "M116 30 V52";
const branches = {
  you: { path: "M116 88 C116 108 44 104 44 126", end: [44, 126] },
  handled: { path: "M116 88 C116 108 188 104 188 126", end: [188, 126] },
} as const;
// Points along each branch's curve (t = 0, ¼, ½, ¾, 1), for the dot to travel.
const route = {
  you: { x: [116, 104.75, 80, 55.25, 44], y: [88, 99.3, 106.3, 113.6, 126] },
  handled: { x: [116, 127.25, 152, 176.75, 188], y: [88, 99.3, 106.3, 113.6, 126] },
};

function urgentAmong(count: number): number {
  const cycles = Math.floor(count / routedCalls.length);
  const rest = routedCalls.slice(0, count % routedCalls.length).filter((call) => call.urgent).length;
  return cycles * urgentPerCycle + rest;
}

/**
 * Calls arrive one by one. Each drops into the receptionist, which puts urgent ones through to you and handles the
 * rest itself; the branch it takes draws in and that side's count goes up. The still frame shows an urgent call.
 */
export function CallRouting() {
  const { ref, inView, reduceMotion } = useTileInView<HTMLDivElement>();
  const startTick = 1;
  const tick = useTicker(inView, () => cycleMs, startTick);
  const call = routedCalls[tick % routedCalls.length] ?? routedCalls[0];
  const side = call?.urgent ? "you" : "handled";

  // A call counts once its dot reaches its side.
  const [arrived, setArrived] = useState(startTick);
  useEffect(() => {
    if (tick === startTick) return;
    const timer = setTimeout(() => setArrived(tick), arriveMs);
    return () => clearTimeout(timer);
  }, [tick]);
  const done = (arrived % countsResetAfter) + 1;
  const you = base.you + urgentAmong(done);
  const handled = base.handled + done - urgentAmong(done);
  const animateIn = tick !== startTick;

  return (
    <div ref={ref} className="flex justify-center">
      {/* Fixed geometry, so it stays left to right on right-to-left pages too. */}
      <div aria-hidden dir="ltr" className="relative h-[156px] w-[232px] text-xs">
        <svg aria-hidden viewBox="0 0 232 156" className="absolute inset-0 size-full overflow-visible" fill="none">
          {[inbound, branches.you.path, branches.handled.path].map((path) => (
            <path key={path} d={path} className="stroke-border" strokeWidth="1.5" strokeDasharray="4 4" />
          ))}
          <motion.path
            key={`in-${tick}`}
            d={inbound}
            className="stroke-primary"
            strokeWidth="1.5"
            initial={animateIn ? { pathLength: reduceMotion ? 1 : 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.45, ease: ease.move }}
          />
          <motion.path
            key={`out-${tick}`}
            d={branches[side].path}
            className={side === "you" ? "stroke-success" : "stroke-primary"}
            strokeWidth="1.5"
            initial={animateIn ? { pathLength: reduceMotion ? 1 : 0, opacity: 0 } : false}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65, ease: ease.move }}
          />
        </svg>

        {/* The incoming call */}
        <div className="absolute inset-x-0 top-0 flex justify-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={tick}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.2 } }}
              transition={{ duration: 0.35, ease: ease.enter }}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full bg-card px-2.5 whitespace-nowrap shadow-(--raised)",
                call?.urgent ? "font-medium text-foreground" : "text-foreground/80",
              )}
            >
              {call?.urgent ? (
                <Siren className="size-3.5 shrink-0" />
              ) : (
                <PhoneIncoming className="size-3.5 shrink-0 text-muted-foreground" />
              )}
              {call?.reason}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* The receptionist, which takes a breath as each call reaches it */}
        <motion.span
          key={`ai-${tick}`}
          initial={animateIn ? { scale: 1 } : false}
          animate={{ scale: [1, 1.12, 1] }}
          transition={{ duration: 0.4, delay: 0.42, ease: ease.move }}
          className="absolute start-[98px] top-[52px] inline-flex size-9 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_6px_16px_-6px_var(--primary)]"
        >
          <Bot className="size-4" />
        </motion.span>

        {/* The dot that carries the call down the branch */}
        {animateIn && (
          <>
            <Dot
              key={`a-${tick}`}
              x={[116, 116]}
              y={[30, 52]}
              className="bg-primary"
              duration={0.45}
              delay={0}
              reduceMotion={reduceMotion}
            />
            <Dot
              key={`b-${tick}`}
              x={route[side].x}
              y={route[side].y}
              className={side === "you" ? "bg-success" : "bg-primary"}
              duration={0.7}
              delay={0.65}
              reduceMotion={reduceMotion}
            />
          </>
        )}

        <Destination
          side="you"
          active={side === "you"}
          pulseKey={side === "you" ? arrived : -1}
          className="start-0 bg-success-soft text-success-foreground"
          icon={<PhoneForwarded className="size-3.5" />}
          label="You"
          count={you}
        />
        <Destination
          side="handled"
          active={side === "handled"}
          pulseKey={side === "handled" ? arrived : -1}
          className="end-0 bg-brand-soft text-brand-soft-foreground"
          icon={<Check className="size-3.5" />}
          label="Handled"
          count={handled}
        />
      </div>
      <p className="sr-only">Urgent calls are put through to you; the receptionist handles everything else.</p>
    </div>
  );
}

function Dot({
  x,
  y,
  duration,
  delay,
  className,
  reduceMotion,
}: {
  x: readonly number[];
  y: readonly number[];
  duration: number;
  delay: number;
  className: string;
  reduceMotion: boolean;
}) {
  if (reduceMotion) return null;
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ x: x.map((value) => value - 5), y: y.map((value) => value - 5), opacity: [0, 1, 1, 1, 0] }}
      transition={{ duration, delay, ease: ease.move }}
      className={cn("absolute start-0 top-0 size-2.5 rounded-full", className)}
    />
  );
}

function Destination({
  side,
  active,
  pulseKey,
  className,
  icon,
  label,
  count,
}: {
  side: "you" | "handled";
  active: boolean;
  pulseKey: number;
  className: string;
  icon: ReactNode;
  label: string;
  count: number;
}) {
  return (
    <motion.span
      key={`${side}-${pulseKey}`}
      initial={{ scale: 1 }}
      animate={active ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.35, ease: ease.move }}
      className={cn(
        "absolute top-[126px] inline-flex h-[30px] items-center gap-1.5 rounded-full px-2.5 font-medium shadow-(--raised) transition-opacity duration-300",
        !active && "opacity-60",
        className,
      )}
    >
      {icon}
      {label}
      <span className="tabular-nums opacity-80">{count}</span>
    </motion.span>
  );
}
