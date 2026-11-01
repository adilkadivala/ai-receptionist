"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Speaker } from "@/content/demo-calls";

type Graph = {
  context: AudioContext;
  element: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  /** Input of the telephone band filter the caller's voice goes through. */
  phoneLine: AudioNode;
  analyser: AnalyserNode;
};

function createGraph(): Graph {
  const context = new AudioContext();
  const element = new Audio();
  element.preload = "auto";
  const source = context.createMediaElementSource(element);

  const analyser = context.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.55;
  analyser.connect(context.destination);

  // A phone line carries about 300–3,400 Hz, so the caller sounds like they're on the phone.
  const highpass = new BiquadFilterNode(context, { type: "highpass", frequency: 300 });
  const lowpass = new BiquadFilterNode(context, { type: "lowpass", frequency: 3400 });
  highpass.connect(lowpass).connect(analyser);

  return { context, element, source, phoneLine: highpass, analyser };
}

/** Whether `error` came from an aborted `wait()` or `play()`. */
export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

/** Waits `ms`, or rejects with an AbortError as soon as `signal` aborts. */
export function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });
}

/**
 * Plays the live call demo's recordings through Web Audio, so the waveform can follow the real voice. Browsers only
 * allow sound after a click, so call `start()` from one; until then nothing is created or downloaded.
 */
export function useCallAudio() {
  const graph = useRef<Graph | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  /** Creates the audio graph on the first call. Returns false if the browser refuses to play sound. */
  const start = useCallback(async (): Promise<boolean> => {
    try {
      graph.current ??= createGraph();
      setAnalyser(graph.current.analyser);
      await graph.current.context.resume();
      return graph.current.context.state === "running";
    } catch {
      return false;
    }
  }, []);

  /** Plays one recording to its end. Rejects with an AbortError when `signal` aborts, and stops the sound. */
  const play = useCallback(async (src: string, speaker: Speaker, signal: AbortSignal): Promise<void> => {
    const current = graph.current;
    if (!current) throw new Error("Call start() before play().");
    const { element, source, phoneLine, analyser: output } = current;
    source.disconnect();
    source.connect(speaker === "caller" ? phoneLine : output);
    element.src = src;

    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => {
        element.removeEventListener("ended", onEnded);
        element.removeEventListener("error", onError);
        signal.removeEventListener("abort", onAbort);
        if (error) reject(error);
        else resolve();
      };
      const onEnded = () => finish();
      const onError = () => finish(new Error(`Couldn't play ${src}`));
      const onAbort = () => {
        element.pause();
        finish(new DOMException("Aborted", "AbortError"));
      };
      element.addEventListener("ended", onEnded);
      element.addEventListener("error", onError);
      signal.addEventListener("abort", onAbort);
      element.play().catch((error: unknown) => finish(error instanceof Error ? error : new Error(String(error))));
    });
  }, []);

  /** Starts downloading recordings that are about to play, so lines follow each other without a gap. */
  const preload = useCallback((sources: string[]) => {
    for (const src of sources) {
      const audio = new Audio();
      audio.preload = "auto";
      audio.src = src;
    }
  }, []);

  /** Stops any sound and removes the waveform's source. */
  const stop = useCallback(() => {
    graph.current?.element.pause();
    setAnalyser(null);
  }, []);

  useEffect(() => () => void graph.current?.context.close(), []);

  return { analyser, start, play, preload, stop };
}
