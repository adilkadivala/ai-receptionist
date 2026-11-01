"use client";

import { cn } from "@receptionist/ui/lib/utils";
import { PhoneCall, PhoneForwarded } from "lucide-react";
import { type MotionValue, motion, useScroll, useTransform } from "motion/react";
import { type CSSProperties, type ReactNode, useRef } from "react";
import { usePrefersReducedMotion } from "@/lib/loop";

// Objects lying on the blueprint panels, like things on a desk: a phone, a calendar, a message note and two call
// notifications, each a small piece of what the receptionist does. They drift at different speeds as the page
// scrolls, and bob gently. Decorative, from the lg breakpoint.

// Shadows for objects on the dark blueprint: a gloss along the top edge and a long drop shadow.
const gloss = "inset 0 1.5px 0 color-mix(in oklch, white 40%, transparent)";
const lift =
  "0 2px 4px color-mix(in oklch, black 30%, transparent), 0 26px 40px -16px color-mix(in oklch, black 80%, transparent)";

type Placement = { object: ReactNode; className: string; depth: number; bob: number; delay?: number };

const phone = <PhoneTile />;
const note = <MessageNote />;
const calendar = <CalendarTile />;
const notices = <CallNotices />;

// Where each object lies. The hero's fade in after the headline (`delay`, ms); the closing panel's are just there.
const layouts: Record<"hero" | "closing", Placement[]> = {
  hero: [
    { object: phone, className: "start-[3%] top-[150px] -rotate-[14deg]", depth: 0.9, bob: 7.2, delay: 620 },
    { object: note, className: "start-[4.5%] top-[318px] rotate-[5deg]", depth: 0.55, bob: 8.4, delay: 760 },
    { object: calendar, className: "end-[3.5%] top-[138px] rotate-[9deg]", depth: 0.75, bob: 7.8, delay: 700 },
    { object: notices, className: "-end-7 top-[300px]", depth: 0.45, bob: 9, delay: 840 },
  ],
  closing: [
    { object: calendar, className: "start-[6%] top-[72px] -rotate-[8deg]", depth: 0.6, bob: 7.6 },
    { object: note, className: "start-[3.5%] bottom-[96px] -rotate-[4deg]", depth: 0.35, bob: 8.8 },
    { object: phone, className: "end-[7%] top-[84px] rotate-[12deg]", depth: 0.8, bob: 7 },
    { object: notices, className: "-end-7 bottom-[88px]", depth: 0.4, bob: 9.4 },
  ],
};

/**
 * The desk objects for the hero (they rise away as it scrolls off) or the closing call to action (they drift through
 * as it passes). Fill a positioned blueprint panel.
 */
export function DeskProps({ variant }: { variant: keyof typeof layouts }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: variant === "hero" ? ["start start", "end start"] : ["start end", "end start"],
  });
  // How far each object travels over that scroll, scaled by its depth.
  const travel: [number, number] = variant === "hero" ? [0, -160] : [60, -60];

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
      {layouts[variant].map((placement) => (
        <Prop
          key={placement.className}
          progress={scrollYProgress}
          travel={travel}
          still={reduceMotion}
          {...placement}
        />
      ))}
    </div>
  );
}

function Prop({
  object,
  className,
  depth,
  bob,
  delay,
  progress,
  travel,
  still,
}: Placement & { progress: MotionValue<number>; travel: [number, number]; still: boolean }) {
  const y = useTransform(progress, [0, 1], [travel[0] * depth, travel[1] * depth]);
  const bobbing = (
    <div className="animate-bob" style={{ "--bob-duration": `${bob}s` } as CSSProperties}>
      {object}
    </div>
  );
  return (
    <motion.div style={still ? undefined : { y }} className={cn("absolute", className)}>
      {delay === undefined ? (
        bobbing
      ) : (
        <div className="animate-rise" style={{ "--rise-delay": `${delay}ms` } as CSSProperties}>
          {bobbing}
        </div>
      )}
    </motion.div>
  );
}

/** A glossy app tile with a phone on it. */
function PhoneTile() {
  return (
    <div
      className="grid size-[76px] place-items-center rounded-[22px] bg-primary text-primary-foreground"
      style={{ boxShadow: `${gloss}, inset 0 -4px 8px color-mix(in oklch, black 25%, transparent), ${lift}` }}
    >
      <PhoneCall className="size-8" strokeWidth={2.1} />
    </div>
  );
}

/** A pinned note of a message the receptionist took. */
function MessageNote() {
  return (
    <div
      className="relative w-[138px] rounded-[4px] bg-warning-soft px-3 pt-4 pb-3.5 font-mono text-[11px]/[1.5] text-warning-foreground"
      style={{ boxShadow: lift }}
    >
      <span
        className="absolute inset-x-0 -top-1.5 mx-auto size-3.5 rounded-full bg-primary"
        style={{ boxShadow: `${gloss}, 0 3px 4px color-mix(in oklch, black 45%, transparent)` }}
      />
      <span className="block font-semibold tracking-[0.04em] uppercase opacity-70">Message</span>
      Mrs. Lee: call back after 3 pm
    </div>
  );
}

/** A desk calendar showing the day's bookings. */
function CalendarTile() {
  return (
    <div
      className="w-[86px] overflow-hidden rounded-[20px] bg-card text-center"
      style={{ boxShadow: `${gloss}, ${lift}` }}
    >
      <div className="bg-primary py-1 font-mono text-[10px] tracking-[0.14em] text-primary-foreground">WED</div>
      <div className="pt-1.5 text-[34px] leading-none font-semibold tracking-[-0.04em] text-foreground">12</div>
      <div className="pt-1 pb-2.5 text-[10px] text-muted-foreground">3 booked</div>
    </div>
  );
}

/** Two call notifications, a booking and an urgent call put through. */
function CallNotices() {
  return (
    <div className="flex flex-col gap-2.5">
      <Notice
        initials="ML"
        name="Maria Lopez"
        detail="Booked · Wed 10:00"
        tone="bg-success-soft text-success-foreground"
      />
      <Notice
        initials={<PhoneForwarded className="size-3.5" />}
        name="Urgent call"
        detail="Put through to Dr. Shah"
        tone="bg-brand-soft text-brand-soft-foreground"
        className="ms-6"
      />
    </div>
  );
}

function Notice({
  initials,
  name,
  detail,
  tone,
  className,
}: {
  initials: ReactNode;
  name: string;
  detail: string;
  tone: string;
  className?: string;
}) {
  return (
    <div
      className={cn("flex w-[214px] items-center gap-2.5 rounded-[14px] bg-card p-2.5", className)}
      style={{ boxShadow: `${gloss}, ${lift}` }}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-[11px] font-semibold", tone)}>
        {initials}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[13px] font-semibold text-foreground">{name}</span>
        <span className="truncate text-[11px] text-muted-foreground">{detail}</span>
      </span>
    </div>
  );
}
