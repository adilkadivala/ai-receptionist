"use client";

import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { type ReactNode, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/loop";

/**
 * The hero's product shot: tilted back and slightly small as it enters, it lies flat at full size by the time it's in
 * the middle of the screen, following the scroll. Under reduced motion it simply sits flat.
 */
export function TiltIn({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.35"] });
  // A light spring, so the tilt settles instead of tracking every scroll tick.
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const rotateX = useTransform(progress, [0, 1], [18, 0]);
  const scale = useTransform(progress, [0, 1], [0.92, 1]);
  const y = useTransform(progress, [0, 1], [40, 0]);

  return (
    <div ref={ref} className={className} style={{ perspective: 1400 }}>
      <motion.div
        style={reduceMotion ? undefined : { rotateX, scale, y, transformOrigin: "50% 0%" }}
        className="will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
