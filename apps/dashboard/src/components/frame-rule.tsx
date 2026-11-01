import { cn } from "@receptionist/ui/lib/utils";

/**
 * A dashed guide line across the bottom of its (positioned) parent, with a small blue square at each end, like the
 * ones that cross the landing page's frame.
 */
export function FrameRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 bottom-0 border-b border-dashed border-frame", className)}
    >
      <span className="absolute start-0 -bottom-1 size-[7px] bg-primary" />
      <span className="absolute end-0 -bottom-1 size-[7px] bg-primary" />
    </div>
  );
}
