import type { ReactNode } from "react";

/**
 * The top of a page, under the site header (which holds the page's h1): an optional headline, a one-line
 * description and, at the end, the page's main actions.
 */
export function PageHeader({
  title,
  children,
  actions,
}: {
  title?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-1">
        {title && <h2 className="text-2xl font-semibold tracking-[-0.025em] text-balance">{title}</h2>}
        {children && <p className="max-w-prose text-pretty text-muted-foreground">{children}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
