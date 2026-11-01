"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { ease } from "@/lib/motion";

// Rises 18 px into place as it scrolls into view, once. Under reduced motion MotionConfig drops the rise and keeps the
// fade. Without JavaScript, layout.tsx's <noscript> style shows everything marked data-reveal.
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: ease.enter } },
};

const viewport = { once: true, amount: 0.25 } as const;

type Tag = "div" | "li" | "ol" | "ul" | "section" | "p" | "span";

/** One block that rises in on scroll. */
export function Reveal({
  as = "div",
  delay = 0,
  className,
  children,
}: {
  as?: Tag;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const Component = motion[as];
  return (
    <Component
      data-reveal
      initial="hidden"
      whileInView="shown"
      viewport={viewport}
      variants={item}
      transition={{ delay }}
      className={className}
    >
      {children}
    </Component>
  );
}

/** A list whose `RevealItem` children rise in one after another. */
export function RevealGroup({
  as = "div",
  stagger = 0.08,
  delay = 0,
  className,
  children,
}: {
  as?: Tag;
  stagger?: number;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const Component = motion[as];
  return (
    <Component
      initial="hidden"
      whileInView="shown"
      viewport={viewport}
      variants={{ shown: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      className={className}
    >
      {children}
    </Component>
  );
}

export function RevealItem({ as = "div", className, children }: { as?: Tag; className?: string; children: ReactNode }) {
  const Component = motion[as];
  return (
    <Component data-reveal variants={item} className={className}>
      {children}
    </Component>
  );
}
