import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";
import { Pattern, type PatternKind } from "./drafting";
import { Soon } from "./soon";

/**
 * One cell of a drafting grid: a patterned grey stage on top with the example standing on it, then a hairline and a
 * short heading and line of text. Cells sit flush in a grid drawn with gap-px, so they have no border of their own.
 * Give cells in the same row the same stage height (`stageClassName`), so their headings line up; the text takes
 * whatever height is left.
 */
export function StageCell({
  title,
  description,
  aside,
  soon = false,
  pattern,
  align = "start",
  className,
  stageClassName,
  patternClassName,
  children,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Shown at the end of the heading row, e.g. a big number. */
  aside?: ReactNode;
  /** The feature isn't built yet: a "Coming soon" label follows the heading. */
  soon?: boolean;
  pattern: PatternKind;
  align?: "start" | "center";
  className?: string;
  stageClassName?: string;
  /** E.g. a blur, to soften the pattern behind busy examples. */
  patternClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex h-full flex-col", className)}>
      <div
        className={cn(
          "relative flex flex-col justify-center overflow-hidden bg-hero px-5 py-9 sm:px-7",
          stageClassName,
        )}
      >
        <Pattern kind={pattern} className={patternClassName} />
        <div className="relative">{children}</div>
      </div>
      <div
        className={cn(
          "flex flex-1 flex-col gap-1.5 border-t px-5 pt-5 pb-6 sm:px-7",
          align === "center" && "items-center text-center",
        )}
      >
        <div className={cn("flex items-baseline gap-3", align === "start" && "justify-between")}>
          <h3 className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[15px] font-semibold tracking-[-0.01em]">
            {title}
            {soon && <Soon />}
          </h3>
          {aside}
        </div>
        {description && <p className="max-w-[46ch] text-sm/relaxed text-pretty text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}
