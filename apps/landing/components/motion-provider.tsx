"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

// Motion skips transform animations for visitors who ask for reduced motion. The looping tiles also stop entirely
// (see lib/loop.ts).
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
