"use client";

import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { Pause, Play } from "lucide-react";
import { motion, useInView } from "motion/react";
import { type ReactNode, useEffect, useReducer, useRef } from "react";
import { type DemoCall, demoCalls } from "@/content/demo-calls";
import { usePrefersReducedMotion } from "@/lib/loop";
import { tileClassName } from "../bento-tile";
import { LiveDot } from "../live-dot";
import { OutcomePill } from "../outcome-pill";
import { Waveform, type WaveTone } from "./waveform";

// A new line of the call every 2.3 s. After the last line the outcome shows for two beats, then the next call starts.
const beatMs = 2300;

type State = { call: number; step: number; seconds: number; pinned: boolean; paused: boolean };
type Action = { type: "beat" } | { type: "second" } | { type: "pick"; call: number } | { type: "toggle-pause" };

function callAt(index: number): DemoCall {
  const call = demoCalls[index];
  if (!call) throw new Error(`No demo call at index ${index}`);
  return call;
}

function reducer(state: State, action: Action): State {
  const lines = callAt(state.call).turns.length;
  switch (action.type) {
    case "beat":
      if (state.step <= lines) return { ...state, step: state.step + 1 };
      // Replay the language the visitor picked; otherwise move on to the next one.
      return {
        ...state,
        call: state.pinned ? state.call : (state.call + 1) % demoCalls.length,
        step: 0,
        seconds: 0,
      };
    case "second":
      return state.step < lines ? { ...state, seconds: state.seconds + 1 } : state;
    case "pick":
      return { ...state, call: action.call, step: 0, seconds: 0, pinned: true };
    case "toggle-pause":
      return { ...state, paused: !state.paused };
  }
}

const statusLabels: Record<WaveTone, string> = {
  ai: "Receptionist speaking…",
  caller: "Caller speaking…",
  idle: "Call ended",
};

function formatClock(totalSeconds: number): string {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

/**
 * The big tile of the product grid: an example call played line by line, in five languages. It runs only while on
 * screen; under reduced motion it shows each call whole, with its outcome, and nothing moves.
 */
export function LiveCallDemo({ className }: { className?: string }) {
  const [state, dispatch] = useReducer(reducer, { call: 0, step: 0, seconds: 0, pinned: false, paused: false });
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduceMotion = usePrefersReducedMotion();
  const running = inView && !reduceMotion && !state.paused;

  useEffect(() => {
    if (!running) return;
    const beat = setInterval(() => dispatch({ type: "beat" }), beatMs);
    const clock = setInterval(() => dispatch({ type: "second" }), 1000);
    return () => {
      clearInterval(beat);
      clearInterval(clock);
    };
  }, [running]);

  const call = callAt(state.call);
  const lines = call.turns.length;
  const step = reduceMotion ? lines : state.step;
  const seconds = reduceMotion ? Math.round((lines * beatMs) / 1000) : state.seconds;
  const ended = step >= lines;
  // Past the last line nobody is speaking.
  const tone: WaveTone = call.turns[step]?.speaker ?? "idle";

  return (
    <div ref={ref} className={cn(tileClassName, "min-h-[560px] gap-4 shadow-xs", className)}>
      <h3 className="sr-only">Example call</h3>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-success-soft px-2 font-mono text-[11px] font-medium tracking-[0.06em] text-success-foreground">
            <LiveDot />
            LIVE
          </span>
          <span lang={call.lang} dir={call.dir} className="text-sm font-semibold">
            {call.business}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-[13px] text-foreground/80 tabular-nums">
            <span className="sr-only">Call time </span>
            {formatClock(seconds)}
          </span>
          {!reduceMotion && (
            <button
              type="button"
              onClick={() => dispatch({ type: "toggle-pause" })}
              aria-label={state.paused ? "Play the example call" : "Pause the example call"}
              className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-foreground/70")}
            >
              {state.paused ? <Play className="fill-current" /> : <Pause className="fill-current" />}
            </button>
          )}
        </div>
      </div>

      <fieldset className="flex flex-wrap gap-1.5">
        <legend className="sr-only">Call language</legend>
        {demoCalls.map((item, index) => {
          const selected = index === state.call;
          return (
            <button
              key={item.id}
              type="button"
              lang={item.lang}
              aria-pressed={selected}
              onClick={() => dispatch({ type: "pick", call: index })}
              className={cn(
                "h-8 rounded-full border px-3 text-[13px] font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected
                  ? "border-primary bg-brand-soft text-brand-soft-foreground"
                  : "bg-card text-foreground/80 hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </fieldset>

      <div className="flex flex-col items-center gap-2.5 rounded-[14px] bg-muted/60 px-3 py-[18px]">
        <Waveform tone={tone} playing={running && !ended} />
        <span className="font-mono text-xs text-foreground/70">{statusLabels[tone]}</span>
      </div>

      {/* Every call is laid out in the same grid cell, so the tile is as tall as the longest one and never jumps.
          Keyed on reduced motion: when that turns on right after hydration, the lines remount already shown. */}
      <div className="grid flex-1 text-sm/normal">
        {demoCalls.map((item, index) => (
          <CallTranscript key={`${item.id}-${reduceMotion}`} call={item} active={index === state.call} step={step} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">Example call. Wording and timing are illustrative.</p>
    </div>
  );
}

function CallTranscript({ call, active, step }: { call: DemoCall; active: boolean; step: number }) {
  const lines = call.turns.length;
  return (
    <div
      lang={call.lang}
      dir={call.dir}
      className={cn("col-start-1 row-start-1 flex flex-col gap-2.5", !active && "invisible")}
    >
      {call.turns.map((turn, line) => (
        <Appear
          key={turn.text}
          shown={active && line <= step}
          className={cn(
            "max-w-[85%] rounded-[14px] px-3.5 py-2.5",
            turn.speaker === "ai"
              ? "self-start rounded-es-[4px] bg-muted"
              : "self-end rounded-ee-[4px] bg-primary text-primary-foreground",
          )}
        >
          {turn.text}
        </Appear>
      ))}
      <Appear shown={active && step >= lines} className="mt-1 self-center">
        <OutcomePill outcome={call.outcome.kind} lang="en" dir="ltr" className="h-[30px] px-3 text-[13px]">
          {call.outcome.label}
        </OutcomePill>
      </Appear>
    </div>
  );
}

/** Rises into place when `shown`; disappears at once when hidden, so a new call starts clean. */
function Appear({ shown, className, children }: { shown: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={shown ? { duration: 0.45, ease: "easeOut" } : { duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
