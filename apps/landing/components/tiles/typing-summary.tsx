"use client";

import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { type SummaryEmail, summaryEmails } from "@/content/tiles";
import { ease, useTicker, useTileInView } from "@/lib/motion";
import { OutcomePill, outcomeLabels } from "../outcome-pill";

const emailMs = 6200;
const typingMsPerLetter = 34;
const wordStaggerS = 0.045;

/**
 * The summary email of each call, written out as it arrives: the subject types itself, the lines follow word by word,
 * then the outcome lands. It moves on to the next call's email. The still frame shows the first one in full.
 */
export function TypingSummary() {
  const { ref, inView } = useTileInView<HTMLDivElement>();
  const tick = useTicker(inView, () => emailMs);
  const email = summaryEmails[tick % summaryEmails.length] ?? summaryEmails[0];

  return (
    <div ref={ref} className="grid h-full content-center">
      <AnimatePresence initial={false} mode="popLayout">
        {email && <Email key={tick} email={email} writing={tick > 0} />}
      </AnimatePresence>
    </div>
  );
}

/** One email. `writing` types it out; otherwise (the first, prerendered one) it shows in full. */
function Email({ email, writing }: { email: SummaryEmail; writing: boolean }) {
  const subjectS = (email.subject.length * typingMsPerLetter) / 1000;
  const linesStartS = subjectS + 0.15;
  const words = email.lines.map((line) => line.split(" "));
  const wordCount = words.reduce((sum, line) => sum + line.length, 0);
  const outcomeS = linesStartS + wordCount * wordStaggerS + 0.25;
  let wordIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.3, ease: ease.move } }}
      transition={{ duration: 0.45, ease: ease.enter }}
      className="col-start-1 row-start-1 flex min-h-[132px] flex-col gap-2 rounded-[14px] bg-card p-4 text-xs shadow-(--float)"
    >
      <div className="flex justify-between gap-2 text-muted-foreground">
        <span>AI Receptionist</span>
        <span className="font-mono">{email.time}</span>
      </div>
      <p className="text-[13px] font-semibold">
        <span className="sr-only">{email.subject}</span>
        <TypedText text={email.subject} durationS={writing ? subjectS : 0} />
      </p>
      <div className="flex flex-col gap-1 text-foreground/80">
        <span className="sr-only">{email.lines.join(" ")}</span>
        {words.map((line) => (
          <p key={line.join(" ")} aria-hidden>
            {line.map((word) => {
              const delay = linesStartS + wordIndex++ * wordStaggerS;
              return (
                <motion.span
                  key={`${word}-${delay}`}
                  initial={writing ? { opacity: 0, y: 4 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay, ease: ease.enter }}
                  className="inline-block whitespace-pre"
                >
                  {`${word} `}
                </motion.span>
              );
            })}
          </p>
        ))}
      </div>
      <motion.span
        initial={writing ? { opacity: 0, scale: 0.9 } : false}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: outcomeS, ease: ease.enter }}
        className="mt-auto self-start"
      >
        <OutcomePill outcome={email.outcome}>{outcomeLabels[email.outcome]}</OutcomePill>
      </motion.span>
    </motion.div>
  );
}

/** Types `text` out over `durationS`, with a caret while it types. Zero shows it in full at once. */
function TypedText({ text, durationS }: { text: string; durationS: number }) {
  const letters = useMotionValue(durationS > 0 ? 0 : text.length);
  const typed = useTransform(letters, (count) => text.slice(0, Math.round(count)));
  const caretOpacity = useTransform(letters, (count) => (count < text.length ? 1 : 0));

  useEffect(() => {
    if (durationS === 0) return;
    const controls = animate(letters, text.length, { duration: durationS, ease: "linear" });
    return () => controls.stop();
  }, [letters, text, durationS]);

  return (
    <span aria-hidden>
      <motion.span>{typed}</motion.span>
      <motion.span
        style={{ opacity: caretOpacity }}
        className="ms-px inline-block h-[1.1em] w-[1.5px] translate-y-[0.15em] bg-primary"
      />
    </span>
  );
}
