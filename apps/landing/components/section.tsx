import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";
import { Reveal } from "./motion/reveal";

// Side gutter inside the framed column: 16 px on phones, 24 px from the sm breakpoint.
export const gutter = "px-4 sm:px-6";

/** One band of the page. Bands run edge to edge between the dashed frame lines. */
export function Section({
  id,
  label,
  className,
  children,
}: {
  id?: string;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-label={label} className={cn(gutter, "py-24", className)}>
      {children}
    </section>
  );
}

// Brand blue for small text. On the dark background plain --primary is under 4.5:1, so it's lifted toward white there.
export const brandText = "text-primary dark:text-[color-mix(in_oklch,var(--primary),white_30%)]";

// Small label: Geist Mono, 12 px, uppercase, wide tracking.
export const eyebrowClassName = "font-mono text-xs tracking-[0.08em] text-muted-foreground uppercase";

/** A section's label, in blue between drafting brackets: ⊣| LABEL |⊢. */
export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn(eyebrowClassName, "inline-flex items-center gap-2", brandText, className)}>
      <Bracket />
      {children}
      <Bracket className="-scale-x-100" />
    </p>
  );
}

function Bracket({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex items-center gap-[3px] opacity-70", className)}>
      <span className="h-px w-1.5 bg-current" />
      <span className="h-2.5 w-px bg-current" />
      <span className="h-1.5 w-px bg-current opacity-60" />
    </span>
  );
}

/** A section's h2 with an optional label above and a lead paragraph below. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "start",
  className,
  titleClassName,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  className?: string;
  titleClassName?: string;
}) {
  return (
    <Reveal className={cn("flex flex-col gap-3.5", align === "center" && "items-center text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        className={cn(
          "text-[clamp(2rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-balance",
          titleClassName,
        )}
      >
        {title}
      </h2>
      {description && <p className="max-w-140 text-base/relaxed text-pretty text-foreground/70">{description}</p>}
    </Reveal>
  );
}
