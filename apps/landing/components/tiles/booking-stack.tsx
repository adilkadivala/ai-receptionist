"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { bookingDay } from "@/content/tiles";
import { ease, useTicker, useTileInView } from "@/lib/motion";

const { day, bookings } = bookingDay;
// How many bookings show at each step: one more each time, a pause with the day full, then it clears.
const shownAt = [1, 2, 3, 4, 4, 0];
const stepMs = [1500, 1500, 1500, 2600, 400, 500];

/**
 * The day's calendar filling up: each booking lands on top of the stack, highlighted as new, and the stack grows
 * upward inside a fixed box so the page never shifts. It starts full, so the still frame shows a busy day.
 */
export function BookingStack() {
  const { ref, inView } = useTileInView<HTMLDivElement>();
  const tick = useTicker(inView, (current) => stepMs[current % stepMs.length] ?? 1500, 3);
  const shown = shownAt[tick % shownAt.length] ?? 0;
  const visible = bookings.slice(0, shown);

  return (
    <div ref={ref} className="flex flex-col gap-2 text-xs">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-mono">{day}</span>
        <span aria-live="off" className="tabular-nums">
          <AnimatedCount value={shown} /> booked
        </span>
      </div>
      {/* Newest first; flex-col-reverse keeps the stack anchored to the bottom as it grows. */}
      <ol className="flex h-[146px] flex-col-reverse gap-1.5 overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((booking, index) => {
            const latest = index === visible.length - 1;
            return (
              <motion.li
                key={booking.time}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.25 } }}
                transition={{ duration: 0.5, ease: ease.enter }}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-lg border px-2.5 py-[7px] transition-colors duration-500",
                  latest ? "border-primary bg-brand-soft text-brand-soft-foreground" : "bg-muted/60 text-foreground/80",
                )}
              >
                <span className="flex min-w-0 gap-2.5">
                  <span className={cn("font-mono", !latest && "text-muted-foreground")}>{booking.time}</span>
                  <span className="truncate">
                    <span className="font-medium">{booking.name}</span> · {booking.need}
                  </span>
                </span>
                {latest ? (
                  <span className="text-[11px] font-medium">New</span>
                ) : (
                  <Check aria-hidden className="size-3.5 shrink-0 text-success" />
                )}
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ol>
    </div>
  );
}

/** A number that rolls up to its new value. */
function AnimatedCount({ value }: { value: number }) {
  return (
    <span className="relative inline-flex overflow-hidden align-bottom">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.35, ease: ease.enter }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
