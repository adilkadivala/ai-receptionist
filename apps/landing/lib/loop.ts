// Shared timing for the landing page's looping animations. Each loop is driven by a clock that only advances
// while its owner says it should play (on screen, and usually only when the visitor allows motion), so loops pause
// in place instead of jumping.
import { cancelFrame, type FrameData, frame, type MotionValue, useMotionValue, useTransform } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(reducedMotionQuery);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Whether the visitor asked for reduced motion. Unlike Motion's useReducedMotion it reads false while hydrating,
 * like the static HTML, and updates right after, so the page never mismatches the server render.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  );
}

/**
 * Milliseconds of play time, advancing only while `playing`. It starts at `startMs`, so the still frame (before
 * JavaScript loads, or under reduced motion) shows a meaningful moment of the loop.
 */
export function useClock(playing: boolean, startMs = 0): MotionValue<number> {
  const clock = useMotionValue(startMs);
  useEffect(() => {
    if (!playing) return;
    const tick = ({ delta }: FrameData) => clock.set(clock.get() + delta);
    frame.update(tick, true);
    return () => cancelFrame(tick);
  }, [playing, clock]);
  return clock;
}

/** How far through a loop of `durationMs` the clock is, from 0 to 1, for a loop that starts `delayMs` later. */
export function useLoopProgress(clock: MotionValue<number>, durationMs: number, delayMs = 0): MotionValue<number> {
  return useTransform(clock, (time) => {
    const elapsed = (time - delayMs) % durationMs;
    return (elapsed < 0 ? elapsed + durationMs : elapsed) / durationMs;
  });
}
