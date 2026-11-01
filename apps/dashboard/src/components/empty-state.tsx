import { Pattern, type PatternKind } from "@receptionist/ui/blocks/drafting";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@receptionist/ui/components/empty";
import { cn } from "@receptionist/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Nothing to show yet, drawn like a cell of the landing page: a patterned grey stage with the icon standing on it as a
 * soft white object, then what's missing and what to do about it.
 */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  pattern = "hex",
  className,
}: {
  icon: LucideIcon;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  pattern?: PatternKind;
  className?: string;
}) {
  return (
    <Empty className={cn("relative overflow-hidden rounded-[16px] bg-hero py-12", className)}>
      <Pattern kind={pattern} />
      <EmptyHeader className="relative">
        <EmptyMedia
          variant="icon"
          className="mb-3 size-12 rounded-[14px] bg-card text-primary shadow-(--raised) [&_svg:not([class*='size-'])]:size-5"
        >
          <Icon aria-hidden strokeWidth={1.75} />
        </EmptyMedia>
        <EmptyTitle className="text-[15px] font-semibold tracking-[-0.01em]">{title}</EmptyTitle>
        {children && <EmptyDescription className="text-foreground/70">{children}</EmptyDescription>}
      </EmptyHeader>
      {action && <EmptyContent className="relative">{action}</EmptyContent>}
    </Empty>
  );
}
