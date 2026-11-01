import { cn } from "@receptionist/ui/lib/utils";
import type { CSSProperties } from "react";

/** A grid of blueprint lines every `size` px, as a background for a bg-(--ink) element. */
export const blueprintGrid = (size: number, color = "var(--ink-line)"): CSSProperties => ({
  backgroundImage: `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`,
  backgroundSize: `${size}px ${size}px`,
});

/** Ruler ticks: a short one every 12 px and a long one every 48 px, along the bottom (or the outer side) of a strip. */
export const rulerTicks = (direction: "x" | "y"): CSSProperties => {
  const toward = direction === "x" ? "90deg" : "180deg";
  const minor = `repeating-linear-gradient(${toward}, var(--ink-line) 0 1px, transparent 1px 12px)`;
  const major = `repeating-linear-gradient(${toward}, color-mix(in oklch, var(--primary-foreground) 22%, transparent) 0 1px, transparent 1px 48px)`;
  return direction === "x"
    ? {
        backgroundImage: `${major}, ${minor}`,
        backgroundSize: "100% 10px, 100% 5px",
        backgroundPosition: "0 100%, 0 100%",
        backgroundRepeat: "repeat-x",
      }
    : {
        backgroundImage: `${major}, ${minor}`,
        backgroundSize: "10px 100%, 5px 100%",
        backgroundRepeat: "repeat-y",
      };
};

const numbers = Array.from({ length: 32 }, (_, index) => index + 1);
const numberClassName = "absolute font-mono text-[9px] text-primary-foreground/35";

/**
 * The drafting mat the landing's hero and final call to action, and the dashboard's sign-in pages, are drawn on: a
 * cutting-mat grid in blueprint lines, a ruler along the top, gridded strips at the sides with construction lines, and
 * a faint dithered light at the top. Fill a positioned element with a bg-(--ink) background. `top` leaves the header a
 * clean band of plain blueprint.
 */
export function Blueprint({ top = 0, className }: { top?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden", className)}
      style={{ top }}
    >
      {/* The whole panel: a faint 24 px grid that fades out toward the bottom. */}
      <div
        className="absolute inset-0 opacity-60"
        style={{ ...blueprintGrid(24), maskImage: "linear-gradient(black, transparent 85%)" }}
      />
      {/* The dithered light, in Signal blue, coming from the top. */}
      <div
        className="absolute inset-x-[20%] top-0 h-[220px] opacity-70"
        style={{
          backgroundImage: "repeating-conic-gradient(var(--primary) 0 25%, transparent 0 50%)",
          backgroundSize: "6px 6px",
          maskImage: "radial-gradient(ellipse 50% 100% at 50% 0%, black, rgb(0 0 0 / 30%) 45%, transparent 75%)",
        }}
      />

      {/* The mat, inset from the panel's sides. */}
      <div className="absolute inset-x-3 top-0 bottom-0 border-x border-(--ink-line) sm:inset-x-[5%]">
        {/* The ruler along the top. */}
        <div className="relative h-7 overflow-hidden border-b border-(--ink-line)" style={rulerTicks("x")}>
          {numbers.map((n) => (
            <span key={n} className={numberClassName} style={{ insetInlineStart: n * 48 + 3, top: 4 }}>
              {n}
            </span>
          ))}
        </div>

        {/* Gridded strips at the sides, from md. */}
        <Strip side="start" />
        <Strip side="end" />
      </div>
    </div>
  );
}

function Strip({ side }: { side: "start" | "end" }) {
  return (
    <div
      className={cn(
        "absolute top-7 bottom-0 hidden w-[clamp(64px,13%,176px)] overflow-hidden md:block",
        side === "start" ? "start-0 border-e border-(--ink-line)" : "end-0 border-s border-(--ink-line)",
      )}
      style={blueprintGrid(12, "color-mix(in oklch, var(--primary-foreground) 5%, transparent)")}
    >
      {/* A vertical ruler on the mat's outer edge. */}
      <div
        className={cn("absolute inset-y-0 w-3", side === "start" ? "start-0" : "end-0 -scale-x-100")}
        style={rulerTicks("y")}
      />
      {numbers.slice(0, 14).map((n) => (
        <span
          key={n}
          className={numberClassName}
          style={{ top: n * 48 - 6, [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: 14 }}
        >
          {15 - n}
        </span>
      ))}
      {/* Construction lines: a protractor arc and two angles from the strip's bottom corner. */}
      <svg
        aria-hidden
        viewBox="0 0 176 320"
        className={cn(
          "absolute bottom-0 h-[320px] w-[176px] text-primary-foreground/12",
          side === "end" ? "end-0 -scale-x-100" : "start-0",
        )}
        fill="none"
        stroke="currentColor"
      >
        <path d="M0 320 L176 148" />
        <path d="M0 320 L120 112" />
        <path d="M0 200 A120 120 0 0 1 120 320" strokeDasharray="3 4" />
        <path d="M0 260 A60 60 0 0 1 60 320" />
      </svg>
    </div>
  );
}
