// Shared motion for the landing page: the two easing curves, and a stepper for tiles that cycle through states.
import { useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./loop";

/** Entering the screen: a fast start and a soft landing. Moving on screen: eased at both ends. */
export const ease = {
  enter: [0.22, 1, 0.36, 1],
  move: [0.65, 0, 0.35, 1],
} as const;

/**
 * For tiles that cycle through states (a new booking, the next call). Unlike the loops in loop.ts, these keep running
 * under reduced motion: MotionConfig then drops their movement and keeps the fades, so the content still changes.
 */
export function useTileInView<T extends Element>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduceMotion = usePrefersReducedMotion();
  return { ref, inView, reduceMotion };
}

/**
 * A counter that ticks up while `active`, waiting `durationMs(tick)` before each tick. It only grows, so callers can
 * key new items on it; use `tick % length` for the current state. It pauses in place and resumes with a full wait.
 */
export function useTicker(active: boolean, durationMs: (tick: number) => number, start = 0): number {
  const [tick, setTick] = useState(start);
  const duration = useRef(durationMs);
  duration.current = durationMs;

  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => setTick((current) => current + 1), duration.current(tick));
    return () => clearTimeout(timer);
  }, [active, tick]);

  return tick;
}

/** True `delayMs` after mount, for an item that arrives in one state and settles into another. */
export function useSettled(delayMs: number, settledAtMount = false): boolean {
  const [settled, setSettled] = useState(settledAtMount);
  useEffect(() => {
    if (settled) return;
    const timer = setTimeout(() => setSettled(true), delayMs);
    return () => clearTimeout(timer);
  }, [settled, delayMs]);
  return settled;
}
