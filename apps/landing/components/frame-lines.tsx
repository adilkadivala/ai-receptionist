import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";

/** The page's column, framed by dashed lines on both sides. Lines that reach past it are clipped at the window. */
export function FrameColumn({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-clip">
      <div className="relative mx-auto max-w-312 border-x border-dashed border-frame">{children}</div>
    </div>
  );
}

/**
 * A dashed line across the whole window at the top of its (positioned) parent, with a small blue square where it
 * crosses each side of the frame.
 */
export function FrameRule({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-x-0 top-0", className)}>
      <div className="absolute -inset-x-[50vw] top-0 border-t border-dashed border-frame" />
      <span className="absolute -start-1 -top-1 size-[7px] bg-primary" />
      <span className="absolute -end-1 -top-1 size-[7px] bg-primary" />
    </div>
  );
}
