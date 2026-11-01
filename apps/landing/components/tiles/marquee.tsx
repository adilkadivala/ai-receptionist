"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { motion, useTransform } from "motion/react";
import type { Greeting } from "@/content/tiles";
import { useClock, useLoopProgress, usePlaying } from "@/lib/loop";

/**
 * A row of chips sliding sideways forever. The list is drawn twice and moved by half its width, so the loop is
 * seamless. Each chip carries its own spacing (not the row's gap) so both halves are exactly the same width.
 */
export function Marquee({
  items,
  durationMs,
  reverse,
  itemClassName,
}: {
  items: Greeting[];
  durationMs: number;
  reverse?: boolean;
  itemClassName?: string;
}) {
  const { ref, playing } = usePlaying<HTMLDivElement>();
  const progress = useLoopProgress(useClock(playing), durationMs);
  const x = useTransform(progress, (value) => `${(reverse ? value - 1 : -value) * 50}%`);

  return (
    <div ref={ref} dir="ltr">
      <motion.div style={{ x }} className="flex w-max">
        {[0, 1].flatMap((copy) =>
          items.map((item) => (
            <span
              key={`${copy}-${item.text}`}
              lang={item.lang}
              dir="auto"
              className={cn(
                "me-2 inline-flex h-8 items-center rounded-full px-3 text-[13px] whitespace-nowrap",
                itemClassName,
              )}
            >
              {item.text}
            </span>
          )),
        )}
      </motion.div>
    </div>
  );
}
