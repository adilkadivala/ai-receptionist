"use client";

import { LogoMark } from "@receptionist/ui/blocks/logo";
import { cn } from "@receptionist/ui/lib/utils";
import { MousePointer2 } from "lucide-react";
import { motion, type Transition, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ease } from "@/lib/motion";
import { OutcomePill } from "./outcome-pill";

// The three "How it works" pictures, drawn as objects on the sheet. The prerendered page shows them finished; one that
// starts below the screen goes back to its start at once and plays as it scrolls into view.

function usePlayOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if ((ref.current?.getBoundingClientRect().top ?? 0) > window.innerHeight) setArmed(true);
  }, []);
  const shown = !armed || inView;
  // Playing uses the given timing; going back to the start is instant.
  const play = (transition: Transition): Transition => (shown ? transition : { duration: 0 });
  return { ref, shown, play };
}

/** Step 1: your number, in a tray, with forwarding switched on and a line down to the receptionist. */
export function ForwardingArt() {
  const { ref, shown, play } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className="mx-auto flex w-full max-w-[264px] flex-col items-center text-xs">
      <div className="w-full rounded-[18px] bg-muted/80 p-1.5 shadow-(--tray)">
        <div className="flex items-center justify-between gap-3 rounded-[13px] bg-card px-3.5 py-3 shadow-(--raised)">
          <span className="flex flex-col gap-0.5">
            <span className="text-[11px] text-muted-foreground">Your number</span>
            <span dir="ltr" className="font-mono text-[13px] font-medium">
              +1 (555) 014-2290
            </span>
          </span>
          <span
            className={cn(
              "flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors delay-300 duration-500",
              shown ? "bg-primary" : "bg-foreground/15",
            )}
          >
            <motion.span
              initial={false}
              animate={{ x: shown ? 16 : 0 }}
              transition={play({ duration: 0.45, delay: 0.3, ease: ease.move })}
              className="size-4 rounded-full bg-card shadow-[0_1px_2px_color-mix(in_oklch,black_30%,transparent)]"
            />
          </span>
        </div>
      </div>
      <svg aria-hidden viewBox="0 0 12 44" className="h-11 w-3 text-primary" fill="none" stroke="currentColor">
        <motion.path
          d="M6 0V38"
          strokeDasharray="3 3"
          initial={false}
          animate={{ pathLength: shown ? 1 : 0 }}
          transition={play({ duration: 0.5, delay: 0.75, ease: ease.move })}
        />
        <motion.path
          d="M2 34L6 39L10 34"
          initial={false}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={play({ duration: 0.2, delay: 1.15 })}
        />
      </svg>
      <motion.span
        initial={false}
        animate={{ opacity: shown ? 1 : 0.5, scale: shown ? 1 : 0.96 }}
        transition={play({ duration: 0.4, delay: 1.2, ease: ease.enter })}
        className="inline-flex items-center gap-2 rounded-full bg-card py-1.5 ps-1.5 pe-3.5 font-medium shadow-(--raised)"
      >
        <LogoMark className="size-6 rounded-full [&_svg]:size-3" />
        Your AI receptionist answers
      </motion.span>
    </div>
  );
}

const facts = [
  { label: "Services and prices", value: "12" },
  { label: "Opening hours", value: "Mon–Sat" },
  { label: "Common questions", value: "18" },
  { label: "Urgent calls", value: "To you", urgent: true },
];

// The paper's torn bottom edge: a row of bites, and solid paper above them.
const tornEdge =
  "radial-gradient(circle 5px at 50% 100%, transparent 97%, black) bottom / 14px 10px repeat-x, linear-gradient(black, black) top / 100% calc(100% - 9px) no-repeat";

/** Step 2: what you tell it, printing out of a slot like a receipt, with a pointer on the urgent-calls line. */
export function BusinessArt() {
  const { ref, shown, play } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className="relative mx-auto w-full max-w-[248px] text-xs">
      {/* The slot */}
      <div className="relative z-10 h-5 rounded-full bg-card shadow-(--raised)">
        <span className="absolute inset-x-3.5 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-foreground/80 shadow-[inset_0_1px_2px_black]" />
      </div>
      {/* The paper, clipped at the slot so it seems to come out of it */}
      <div className="-mt-2.5 overflow-hidden px-3 pb-3">
        <motion.div
          initial={false}
          animate={{ y: shown ? 0 : "-70%" }}
          transition={play({ duration: 0.9, delay: 0.2, ease: ease.enter })}
          style={{ filter: "drop-shadow(0 6px 8px color-mix(in oklch, var(--foreground) 14%, transparent))" }}
        >
          <div
            className="flex flex-col gap-1.5 bg-card px-3 pt-5 pb-5"
            style={{ mask: tornEdge, WebkitMask: tornEdge }}
          >
            <p className="mb-0.5 font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
              Rivera Plumbing
            </p>
            {facts.map((fact) => (
              <p
                key={fact.label}
                className="flex items-center justify-between gap-2 rounded-[8px] bg-muted/70 px-2.5 py-1.5 text-foreground/85"
              >
                {fact.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-px text-[11px] font-medium",
                    fact.urgent
                      ? "bg-brand-soft text-brand-soft-foreground"
                      : "bg-card text-foreground/70 shadow-(--raised)",
                  )}
                >
                  {fact.value}
                </span>
              </p>
            ))}
          </div>
        </motion.div>
      </div>
      <motion.span
        initial={false}
        animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : 14, y: shown ? 0 : 10 }}
        transition={play({ duration: 0.5, delay: 1.1, ease: ease.enter })}
        className="absolute end-1 bottom-6"
      >
        <MousePointer2 className="size-5 fill-foreground stroke-card" strokeWidth={1.5} />
      </motion.span>
    </div>
  );
}

const summaries = [
  { name: "Unknown caller", detail: "Burst pipe in the basement", outcome: "transferred" as const },
  { name: "Maria Lopez", detail: "Sink leak, Wed 10:00", outcome: "booked" as const },
];

/** Step 3: call summaries dropping into your inbox tray, the newest in front. */
export function SummaryArt() {
  const { ref, shown, play } = usePlayOnce<HTMLDivElement>();
  return (
    <div ref={ref} aria-hidden className="relative mx-auto h-[172px] w-full max-w-[264px] text-xs">
      {summaries.map((summary, index) => (
        <motion.div
          key={summary.name}
          initial={false}
          animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : -28 }}
          transition={play({ duration: 0.6, delay: 0.25 + index * 0.35, ease: ease.enter })}
          className={cn(
            "absolute flex flex-col gap-1.5 rounded-[12px] bg-card p-3 shadow-(--raised)",
            index === 0 ? "inset-x-5 top-0 -rotate-2" : "inset-x-2.5 top-7 rotate-1",
          )}
        >
          <span className="flex items-center justify-between gap-2">
            <span className="font-semibold">{summary.name}</span>
            <OutcomePill outcome={summary.outcome} className="h-5 text-[11px]" />
          </span>
          <span className="text-muted-foreground">{summary.detail}</span>
          <span className="h-1.5 w-3/4 rounded-full bg-muted" />
        </motion.div>
      ))}
      {/* The tray's front, covering the cards' lower halves */}
      <div className="absolute inset-x-0 bottom-0 flex h-[84px] items-end justify-between rounded-[18px] bg-card/95 px-4 pb-3.5 shadow-(--float) backdrop-blur-sm">
        <span className="font-mono text-[10px] tracking-[0.12em] text-muted-foreground uppercase">Inbox</span>
        <span className="text-muted-foreground">Summary emailed</span>
      </div>
    </div>
  );
}
