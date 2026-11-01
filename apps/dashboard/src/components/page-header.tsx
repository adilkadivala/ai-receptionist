import { Eyebrow } from "@receptionist/ui/blocks/drafting";
import type { ReactNode } from "react";

/**
 * The top of a page, under the site header (which holds the page's h1), set like a landing page section heading: an
 * optional bracketed label and headline, a one-line description and, at the end, the page's main actions.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-2.5">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        {title && (
          <h2 className="text-[clamp(1.625rem,3vw,2rem)] leading-[1.1] font-semibold tracking-[-0.035em] text-balance">
            {title}
          </h2>
        )}
        {children && <p className="max-w-prose text-[15px]/relaxed text-pretty text-foreground/70">{children}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
