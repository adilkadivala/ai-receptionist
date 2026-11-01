"use client";

import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { motion, useInView } from "motion/react";
import { type ReactNode, useCallback, useEffect, useReducer, useRef, useState } from "react";
import { audioPath, type DemoCall, demoCalls } from "@/content/demo-calls";
import { useBrowserVoice } from "@/lib/browser-voice";
import { isAbort, useCallAudio, wait } from "@/lib/call-audio";
import { usePrefersReducedMotion } from "@/lib/loop";
import { ease } from "@/lib/motion";
import { tileClassName } from "../bento-tile";
import { LiveDot } from "../live-dot";
import { OutcomePill } from "../outcome-pill";
import { Waveform, type WaveTone } from "./waveform";

// Without sound, each line stays up about as long as it takes to read. The outcome then shows before the next call.
const gapMs = 350;
const outcomeMs = 3000;
const readingMs = (text: string) => Math.min(3600, Math.max(1700, text.length * 42));

type State = { call: number; step: number; seconds: number; pinned: boolean; paused: boolean; run: number };
type Action =
  | { type: "step"; step: number }
  | { type: "next" }
  | { type: "second" }
  | { type: "pick"; call: number }
  | { type: "restart" }
  | { type: "toggle-pause" };

function callAt(index: number): DemoCall {
  const call = demoCalls[index];
  if (!call) throw new Error(`No demo call at index ${index}`);
  return call;
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "step":
      return { ...state, step: action.step };
    case "next":
      // Replay the language the visitor picked; otherwise move on to the next one.
      return {
        ...state,
        call: state.pinned ? state.call : (state.call + 1) % demoCalls.length,
        step: 0,
        seconds: 0,
        run: state.run + 1,
      };
    case "second":
      return { ...state, seconds: state.seconds + 1 };
    case "pick":
      return { ...state, call: action.call, step: 0, seconds: 0, pinned: true, paused: false, run: state.run + 1 };
    case "restart":
      return { ...state, step: 0, seconds: 0, paused: false, run: state.run + 1 };
    case "toggle-pause":
      return { ...state, paused: !state.paused };
  }
}

// The demo is always labeled as an example, and says whose voice reads it.
const captions = {
  recordings: "Example call, voiced by the same AI voice callers hear. Wording and timing are illustrative.",
  browser: "Example call. With sound on, your browser's own voice reads it. Wording and timing are illustrative.",
  none: "Example call. Wording and timing are illustrative.",
};

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
 * The big tile of the product grid: an example call played line by line, in five languages. With sound on it plays the
 * Cartesia recordings, or, until they exist, the browser's own voices read it. It runs only while on screen. Under
 * reduced motion the lines still appear, with a fade instead of a rise, and the waveform stands still.
 */
export function LiveCallDemo({ hasAudio, className }: { hasAudio: boolean; className?: string }) {
  const [state, dispatch] = useReducer(reducer, {
    call: 0,
    step: 0,
    seconds: 0,
    pinned: false,
    paused: false,
    run: 0,
  });
  const [sound, setSound] = useState(false);
  const audio = useCallAudio();
  const browserVoice = useBrowserVoice();
  // Recordings when they exist; otherwise the browser's voices, where it has any.
  const voice = hasAudio ? "recordings" : browserVoice.supported ? "browser" : null;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduceMotion = usePrefersReducedMotion();
  const running = inView && !state.paused;

  const call = callAt(state.call);
  const lines = call.turns.length;
  const ended = state.step >= lines;
  // The driver resumes from the line on screen, replaying it, after a pause or a scroll away.
  const stepRef = useRef(state.step);
  stepRef.current = state.step;

  const { play, preload } = audio;
  const { speakLine } = browserVoice;
  // biome-ignore lint/correctness/useExhaustiveDependencies: state.run restarts the call from its first line.
  useEffect(() => {
    if (!running) return;
    const controller = new AbortController();
    const { signal } = controller;
    const current = callAt(state.call);

    async function drive() {
      if (sound && voice === "recordings") preload(current.turns.map((_, line) => audioPath(current, line)));
      for (let line = stepRef.current; line < current.turns.length; line++) {
        const turn = current.turns[line];
        if (!turn) break;
        dispatch({ type: "step", step: line });
        const spoken =
          !sound || !voice
            ? null
            : voice === "recordings"
              ? play(audioPath(current, line), turn.speaker, signal)
              : speakLine(turn.speech ?? turn.text, current.voiceLanguage, turn.speaker, signal);
        // No voice for the language, or a recording that fails to load: the line waits its reading time instead.
        await (spoken ?? wait(readingMs(turn.text), signal)).catch((error: unknown) => {
          if (isAbort(error)) throw error;
          return wait(readingMs(turn.text), signal);
        });
        await wait(gapMs, signal);
      }
      dispatch({ type: "step", step: current.turns.length });
      await wait(outcomeMs, signal);
      dispatch({ type: "next" });
    }

    drive().catch((error: unknown) => {
      if (!isAbort(error)) reportError(error);
    });
    return () => controller.abort();
  }, [running, state.call, state.run, sound, voice, play, preload, speakLine]);

  useEffect(() => {
    if (!running || ended) return;
    const clock = setInterval(() => dispatch({ type: "second" }), 1000);
    return () => clearInterval(clock);
  }, [running, ended]);

  // Sound needs a click, so this only runs from one: the button below or the hero's link.
  const startSound = useCallback(async () => {
    if (!voice) return;
    if (!(await (voice === "recordings" ? audio.start() : browserVoice.start()))) return;
    setSound(true);
    dispatch({ type: "restart" });
  }, [voice, audio.start, browserVoice.start]);

  // Links to #listen ("Hear a live call" in the hero) start the demo with sound: their click allows it.
  useEffect(() => {
    if (!voice) return;
    const onClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest('a[href="#listen"]')) void startSound();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [voice, startSound]);

  function toggleSound() {
    if (!sound) return void startSound();
    audio.stop();
    browserVoice.stop();
    setSound(false);
  }

  // Past the last line nobody is speaking.
  const tone: WaveTone = call.turns[state.step]?.speaker ?? "idle";

  return (
    <div ref={ref} id="listen" className={cn(tileClassName, "min-h-[560px] scroll-mt-6 gap-4 shadow-xs", className)}>
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
        <div className="flex items-center gap-1.5">
          <span className="me-1 font-mono text-[13px] text-foreground/80 tabular-nums">
            <span className="sr-only">Call time </span>
            {formatClock(state.seconds)}
          </span>
          {voice && (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={sound}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-3.5",
                sound
                  ? "border-primary bg-brand-soft text-brand-soft-foreground"
                  : "bg-card text-foreground/80 hover:bg-muted",
              )}
            >
              {sound ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
              {sound ? "Mute" : "Listen"}
            </button>
          )}
          <button
            type="button"
            onClick={() => dispatch({ type: "toggle-pause" })}
            aria-label={state.paused ? "Play the example call" : "Pause the example call"}
            className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }), "text-foreground/70")}
          >
            {state.paused ? <Play className="fill-current" /> : <Pause className="fill-current" />}
          </button>
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
        <Waveform tone={tone} playing={running && !ended && !reduceMotion} analyser={sound ? audio.analyser : null} />
        <span className="font-mono text-xs text-foreground/70">{statusLabels[tone]}</span>
      </div>

      {/* Every call is laid out in the same grid cell, so the tile is as tall as the longest one and never jumps. */}
      <div className="grid flex-1 text-sm/normal">
        {demoCalls.map((item, index) => (
          <CallTranscript key={item.id} call={item} active={index === state.call} step={state.step} />
        ))}
      </div>

      <p className="text-xs text-muted-foreground">{captions[voice ?? "none"]}</p>
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
              ? "origin-bottom-left self-start rounded-es-[4px] bg-muted rtl:origin-bottom-right"
              : "origin-bottom-right self-end rounded-ee-[4px] bg-primary text-primary-foreground rtl:origin-bottom-left",
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

/** Grows out of its speaker's side when `shown`; disappears at once when hidden, so a new call starts clean. */
function Appear({ shown, className, children }: { shown: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      initial={false}
      animate={shown ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
      transition={shown ? { duration: 0.5, ease: ease.enter } : { duration: 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
