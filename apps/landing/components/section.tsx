import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";

// Page width and side gutter, shared by every section, the header and the footer.
export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

/** One band of the landing page. `muted` bands alternate with plain ones. */
export function Section({
  id,
  muted,
  className,
  children,
}: {
  id?: string;
  muted?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={cn("scroll-mt-16 py-20 sm:py-28", muted && "border-y bg-muted/40", className)}>
      <Container>{children}</Container>
    </section>
  );
}

// Brand blue for small text. On the dark background plain --primary is under 4.5:1, so it's lifted toward white there.
export const brandText = "text-primary dark:text-[color-mix(in_oklch,var(--primary),white_25%)]";

/** Small monospace label above a heading. */
export function Eyebrow({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <p className={cn("font-mono text-xs font-medium tracking-wider uppercase", brandText, className)}>{children}</p>
  );
}

/** A section's h2 with an optional eyebrow above and a lead paragraph below. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <Eyebrow className="mb-3">{eyebrow}</Eyebrow>}
      <h2 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-lg text-pretty text-muted-foreground">{description}</p>}
    </div>
  );
}
