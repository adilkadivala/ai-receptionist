"use client";

import { animate, motion, useInView, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/loop";
import { ease } from "@/lib/motion";

/**
 * A number that counts up from zero when it scrolls into view. The prerendered page shows the real value, and so does
 * a number already on screen when the page loads, or any number under reduced motion.
 */
export function CountUp({ value, durationS = 1.4 }: { value: number; durationS?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduceMotion = usePrefersReducedMotion();
  const count = useMotionValue(value);
  const shown = useTransform(count, (current) => Math.round(current).toLocaleString("en-US"));
  // Whether the number started off screen, so counting from zero can't flash a value the visitor already saw.
  const startedHidden = useRef<boolean | null>(null);

  useEffect(() => {
    if (startedHidden.current === null) {
      startedHidden.current = !inView;
      if (startedHidden.current && !reduceMotion) count.set(0);
    }
  }, [inView, reduceMotion, count]);

  useEffect(() => {
    // Reduced motion is only known after hydration, possibly after the number was set to zero above.
    if (reduceMotion) return void count.set(value);
    if (!inView || !startedHidden.current) return;
    const controls = animate(count, value, { duration: durationS, ease: ease.enter });
    return () => controls.stop();
  }, [inView, reduceMotion, count, value, durationS]);

  return (
    <motion.span ref={ref} className="tabular-nums">
      {shown}
    </motion.span>
  );
}
