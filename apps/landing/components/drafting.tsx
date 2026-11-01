import { cn } from "@receptionist/ui/lib/utils";
import type { CSSProperties } from "react";

// The drafting-sheet details the page is drawn with: stage patterns and hatched bands.

const svg = (body: string, width: number, height: number) =>
  `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>${body}</svg>`)}")`;

// Each pattern is a mask over a fill, so it takes its colour from the theme. Sizes in px.
const masks = {
  // A honeycomb of near-regular hexagons.
  hex: {
    image: svg("<path d='M14 0L28 8V24L14 32L0 24V8Z M14 32V48' fill='none' stroke='black'/>", 28, 48),
    size: "28px 48px",
  },
  // Chevrons, like a woven strap.
  chevron: {
    image: svg("<path d='M0 6L10 0L20 6M0 16L10 10L20 16' fill='none' stroke='black'/>", 20, 20),
    size: "20px 20px",
  },
  grid: {
    image: svg("<path d='M0 .5H24M.5 0V24' fill='none' stroke='black'/>", 24, 24),
    size: "24px 24px",
  },
  dots: {
    image: svg("<circle cx='8' cy='8' r='1' fill='black'/>", 16, 16),
    size: "16px 16px",
  },
} as const;

export type PatternKind = keyof typeof masks;

/**
 * A faint pattern filling its positioned parent, drawn in the frame colour with a white line 1 px below it, so it
 * reads as pressed into the sheet. It fades out toward the edges.
 */
export function Pattern({ kind, className }: { kind: PatternKind; className?: string }) {
  const { image, size } = masks[kind];
  const layer = (offset: string): CSSProperties => ({
    maskImage: image,
    maskSize: size,
    maskPosition: offset,
    WebkitMaskImage: image,
    WebkitMaskSize: size,
    WebkitMaskPosition: offset,
  });
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ maskImage: "radial-gradient(ellipse 75% 70% at 50% 45%, black 30%, transparent 100%)" }}
    >
      <div className="absolute inset-0 bg-card/80 dark:bg-transparent" style={layer("center 1px")} />
      <div className="absolute inset-0 bg-frame" style={layer("center 0")} />
    </div>
  );
}

/** A band of diagonal hatching between hairlines, the full width of the framed column. */
export function HatchBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("h-10 border-y", className)}
      style={{ backgroundImage: "repeating-linear-gradient(135deg, var(--frame) 0 1px, transparent 1px 8px)" }}
    />
  );
}
