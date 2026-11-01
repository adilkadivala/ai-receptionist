import { cn } from "@receptionist/ui/lib/utils";

/** A green status dot with a ring that pulses outward (CSS only; still under reduced motion). */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("relative flex size-1.5 shrink-0", className)}>
      <span className="absolute inset-0 rounded-full bg-success opacity-0 motion-safe:animate-[live-ring_1.7s_ease-out_infinite]" />
      <span className="relative size-1.5 rounded-full bg-success" />
    </span>
  );
}
