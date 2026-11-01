import { blueprintGrid, rulerTicks } from "@receptionist/ui/blocks/blueprint";
import { cn } from "@receptionist/ui/lib/utils";

/**
 * The blueprint the sidebar is drawn on: a faint 24 px grid that fades out toward the bottom, as on the landing
 * page's hero. It fills the sidebar, so the sidebar's sections sit above it with `relative`.
 */
export function SidebarMat() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-60"
      style={{ ...blueprintGrid(24), maskImage: "linear-gradient(black, transparent 75%)" }}
    />
  );
}

const marks = [1, 2, 3, 4, 5];

/** A short ruler drawn across the sidebar under its header, numbered every 48 px like the landing's. */
export function SidebarRuler({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("relative mx-2 h-5 shrink-0 overflow-hidden border-b border-sidebar-border", className)}
      style={rulerTicks("x")}
    >
      {marks.map((n) => (
        <span
          key={n}
          className="absolute top-0.5 font-mono text-[9px] text-sidebar-foreground/35"
          style={{ insetInlineStart: n * 48 + 3 }}
        >
          {n}
        </span>
      ))}
    </div>
  );
}
