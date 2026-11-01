"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Speaker } from "@/content/demo-calls";

// Until the Cartesia recordings exist (scripts/demo-audio.ts), the live call demo reads its lines with the browser's
// own voices. They differ by browser and system, and a browser with no voice for a language plays that call silently.

/** Voice names that usually mean the more natural voices a system offers. */
const naturalVoice = /natural|neural|premium|enhanced|google|online/i;

/** The browser's voices. Chrome fills the list after page load, so this waits for it, briefly. */
function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);
  return new Promise((resolve) => {
    const done = () => {
      clearTimeout(timer);
      speechSynthesis.removeEventListener("voiceschanged", done);
      resolve(speechSynthesis.getVoices());
    };
    const timer = setTimeout(done, 1500);
    speechSynthesis.addEventListener("voiceschanged", done);
  });
}

// A voice's language without its region: "ar-SA" → "ar".
const languageOf = (voice: SpeechSynthesisVoice) => voice.lang.toLowerCase().split(/[-_]/)[0] ?? "";

/** A voice for each side of the call in `language` ("fr"), two different ones when the browser has them. */
function pickVoices(voices: SpeechSynthesisVoice[], language: string) {
  const matching = voices
    .filter((voice) => languageOf(voice) === language)
    .sort((a, b) => Number(naturalVoice.test(b.name)) - Number(naturalVoice.test(a.name)));
  const [ai, other] = matching;
  return ai ? { ai, caller: other ?? ai } : null;
}

// The utterances being spoken. Chrome can drop an utterance nothing refers to, and then never says it ended.
const speaking = new Set<SpeechSynthesisUtterance>();

function speak(text: string, voice: SpeechSynthesisVoice, pitch: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.pitch = pitch;
    let settled = false;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", onAbort);
      if (error) reject(error);
      else resolve();
    };
    const onAbort = () => {
      speechSynthesis.cancel();
      finish(new DOMException("Aborted", "AbortError"));
    };
    // Some browsers occasionally never fire "end"; the call moves on regardless.
    const timer = setTimeout(() => finish(), Math.max(6000, text.length * 120));
    utterance.onend = () => finish();
    utterance.onerror = (event) => finish(new Error(`Speech failed: ${event.error}`));
    signal.addEventListener("abort", onAbort);
    speaking.add(utterance);
    utterance.addEventListener("end", () => speaking.delete(utterance));
    utterance.addEventListener("error", () => speaking.delete(utterance));
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  });
}

/** Reads the live call demo aloud with the browser's built-in voices. `start()` must run from a click. */
export function useBrowserVoice() {
  const voices = useRef<SpeechSynthesisVoice[]>([]);
  // The languages the browser has a voice for ("en", "fr"…). Chrome, for one, has none for Arabic, and many Linux
  // browsers have none at all. Known only in the browser, so it stays empty through hydration and in the prerendered
  // page.
  const [languages, setLanguages] = useState<ReadonlySet<string>>(() => new Set());

  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const update = () => {
      voices.current = speechSynthesis.getVoices();
      setLanguages(new Set(voices.current.map(languageOf)));
    };
    void loadVoices().then(update);
    speechSynthesis.addEventListener("voiceschanged", update);
    return () => speechSynthesis.removeEventListener("voiceschanged", update);
  }, []);

  /** Readies speech. Returns false if the browser has no voices. */
  const start = useCallback(async (): Promise<boolean> => {
    // iOS only lets a page speak after it has spoken from a click, so say nothing, silently, right away.
    const unlock = new SpeechSynthesisUtterance(" ");
    unlock.volume = 0;
    speechSynthesis.speak(unlock);
    if (voices.current.length === 0) voices.current = await loadVoices();
    return voices.current.length > 0;
  }, []);

  /**
   * Speaks one line in `language` to its end, the caller a little lower when both sides share a voice. Returns null
   * when the browser has no voice for the language, so the caller can wait in silence instead.
   */
  const speakLine = useCallback(
    (text: string, language: string, speaker: Speaker, signal: AbortSignal): Promise<void> | null => {
      const pair = pickVoices(voices.current, language);
      if (!pair) return null;
      const shared = pair.ai === pair.caller;
      const pitch = speaker === "caller" && shared ? 0.8 : 1;
      return speak(text, pair[speaker], pitch, signal);
    },
    [],
  );

  const stop = useCallback(() => speechSynthesis.cancel(), []);

  useEffect(() => () => void (typeof speechSynthesis !== "undefined" && speechSynthesis.cancel()), []);

  /** Whether the browser has any voice at all, and one for `language`. */
  const supported = languages.size > 0;
  const hasVoice = useCallback((language: string) => languages.has(language), [languages]);

  return { supported, hasVoice, start, speakLine, stop };
}
