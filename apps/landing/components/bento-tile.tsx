import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";

// A product-frame tile: 20 px corners, a hairline and a white surface.
export const tileClassName = "flex flex-col gap-3.5 rounded-[20px] border bg-card p-5";

/**
 * One tile of the product grid: a short heading and line of text, then a small animated example below them.
 * `row` puts the example beside the text when there's room.
 */
export function BentoTile({
  title,
  description,
  aside,
  layout = "column",
  className,
  children,
}: {
  title: string;
  description?: string;
  /** Shown at the end of the heading row, e.g. a big number. */
  aside?: ReactNode;
  layout?: "column" | "row";
  className?: string;
  children: ReactNode;
}) {
  const heading = (
    <div className={cn("flex flex-col gap-1", layout === "row" && "flex-[1_1_180px]")}>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">{title}</h3>
        {aside}
      </div>
      {description && <p className="text-[13px]/normal text-muted-foreground">{description}</p>}
    </div>
  );

  return (
    <div className={cn(tileClassName, layout === "row" && "flex-row flex-wrap gap-4", className)}>
      {heading}
      <div className={cn("min-w-0", layout === "row" ? "flex-[2_1_260px]" : "mt-auto")}>{children}</div>
    </div>
  );
}
