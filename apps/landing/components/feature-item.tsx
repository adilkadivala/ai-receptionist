import { cn } from "@receptionist/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** One ruled item in a list of features or commitments: an inline icon, a title, a sentence or two. */
export function FeatureItem({
  icon: Icon,
  title,
  badge,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("border-t pt-5", className)}>
      <h3 className="flex flex-wrap items-center gap-x-2.5 gap-y-1 font-medium">
        <Icon className="size-5 shrink-0 text-primary" aria-hidden />
        {title}
        {badge}
      </h3>
      <p className="mt-2 text-sm/6 text-pretty text-muted-foreground">{children}</p>
    </div>
  );
}
