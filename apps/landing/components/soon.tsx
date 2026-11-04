import { cn } from "@receptionist/ui/lib/utils";

/** Marks a feature that isn't built yet, wherever the page shows it, so the page never promises what a caller can't
 * get today. Set `soon: true` on its copy in `content/`. */
export function Soon({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 shrink-0 items-center rounded-full border px-2 font-mono text-[10.5px] font-normal tracking-[0.08em] whitespace-nowrap text-muted-foreground uppercase",
        className,
      )}
    >
      Coming soon
    </span>
  );
}
