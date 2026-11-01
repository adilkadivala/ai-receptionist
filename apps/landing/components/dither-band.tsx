import { cn } from "@receptionist/ui/lib/utils";
import type { CSSProperties, ReactNode } from "react";

// The band's top edge steps down in pixels of the hero grey above it: 75%, 50%, 25%, then sparse dots.
const rows: { id: string; style: CSSProperties }[] = [
  {
    id: "75",
    style: { backgroundImage: "conic-gradient(transparent 25%, var(--hero) 0)", backgroundSize: "6px 6px" },
  },
  {
    id: "50",
    style: {
      backgroundImage: "repeating-conic-gradient(var(--hero) 0 25%, transparent 0 50%)",
      backgroundSize: "6px 6px",
      backgroundPosition: "3px 0",
    },
  },
  {
    id: "25",
    style: { backgroundImage: "conic-gradient(var(--hero) 25%, transparent 0)", backgroundSize: "6px 6px" },
  },
  {
    id: "dots",
    style: { backgroundImage: "radial-gradient(var(--hero) 1.4px, transparent 1.5px)", backgroundSize: "12px 12px" },
  },
];

/** A solid primary band whose top edge dithers out of the hero grey. Leave room at the top for the four rows. */
export function DitherBand({
  className,
  rowClassName = "h-4",
  children,
}: {
  className?: string;
  /** Height of each of the four rows of pixels. */
  rowClassName?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("relative bg-primary", className)}>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex flex-col">
        {rows.map((row) => (
          <div key={row.id} className={rowClassName} style={row.style} />
        ))}
      </div>
      {children}
    </div>
  );
}
