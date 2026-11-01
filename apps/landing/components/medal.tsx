import { cn } from "@receptionist/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

// A ribbon strap: Signal blue with two white stripes, finely ribbed, darker where it bends behind the disc.
const strap: CSSProperties = {
  backgroundImage: [
    "linear-gradient(transparent 55%, color-mix(in oklch, black 28%, transparent))",
    "repeating-linear-gradient(0deg, color-mix(in oklch, black 10%, transparent) 0 1px, transparent 1px 3px)",
    "linear-gradient(90deg, var(--primary) 0 9px, var(--primary-foreground) 9px 13px, var(--primary) 13px 31px, var(--primary-foreground) 31px 35px, var(--primary) 35px)",
  ].join(", "),
};

/**
 * A medal hanging from a striped ribbon, its icon engraved in the middle: the trust section's picture. The ribbon runs
 * up out of its (clipped) parent. It swings a little when its `group` is hovered.
 */
export function Medal({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex origin-[50%_-80px] flex-col items-center transition-transform duration-500 ease-out motion-safe:group-hover:rotate-[2.5deg]",
        className,
      )}
    >
      {/* The ribbon: two straps meeting behind the disc */}
      <div className="relative -mt-14 h-[150px] w-[124px]">
        <span className="absolute start-[6px] top-0 h-full w-11 origin-bottom skew-x-[14deg]" style={strap} />
        <span className="absolute end-[6px] top-0 h-full w-11 origin-bottom -skew-x-[14deg]" style={strap} />
      </div>
      {/* The disc, domed, with a dish pressed into it */}
      <div
        className="relative -mt-12 grid size-[152px] place-items-center rounded-full bg-card"
        style={{ boxShadow: "var(--medal)" }}
      >
        <div
          className="grid size-[108px] place-items-center rounded-full bg-card"
          style={{ boxShadow: "var(--medal-dish)" }}
        >
          <Icon className="size-11 text-foreground/25" strokeWidth={1.6} style={{ filter: "var(--engrave)" }} />
        </div>
      </div>
    </div>
  );
}
