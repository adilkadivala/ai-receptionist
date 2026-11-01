import { Eyebrow } from "@receptionist/ui/blocks/drafting";
import type { ReactNode } from "react";

/**
 * A section's title as the landing page labels its sections: in blue mono between drafting brackets, with a line of
 * description under it and, at the end, the section's own controls.
 */
export function SectionTitle({
  id,
  title,
  description,
  actions,
}: {
  /** For the section's aria-labelledby. */
  id?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 flex-col gap-2">
        <Eyebrow as="h2" id={id}>
          {title}
        </Eyebrow>
        {description && <p className="max-w-prose text-pretty text-foreground/70">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-x-4 gap-y-2">{actions}</div>}
    </div>
  );
}
