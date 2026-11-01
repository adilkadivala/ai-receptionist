import { Badge } from "@receptionist/ui/components/badge";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";
import { resting } from "./surfaces";

/**
 * One number an owner checks, drawn as a cell of the landing page's hairline grid: a label, a resting, one big number and
 * a line on what it's counted against. `children` sits under the number, e.g. a usage bar. It has no frame of its own:
 * place it in a grid drawn with gap-px, or give it one with `className`.
 */
export function StatCard({
  label,
  value,
  badge,
  hint,
  loading,
  className,
  children,
}: {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 px-4 py-5 lg:px-6", className)}>
      <div className="flex min-h-[22px] flex-wrap items-start justify-between gap-x-3 gap-y-1.5">
        <p className="text-[13px] text-muted-foreground">{label}</p>
        {badge && !loading && badge}
      </div>
      {loading ? (
        <>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-40" />
        </>
      ) : (
        <>
          <p className="text-[32px] leading-none font-semibold tracking-[-0.035em] tabular-nums">{value}</p>
          {children}
          {hint && <p className="mt-auto text-[13px] text-muted-foreground">{hint}</p>}
        </>
      )}
    </div>
  );
}

/** "+12.4%" against the previous period, green going up and amber going down. Nothing when there's no baseline. */
export function TrendBadge({ change, against }: { change: number | null; against: string }) {
  if (change === null) return null;
  const up = change >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  const text = `${up ? "+" : "−"}${Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;

  return (
    <Badge
      variant="outline"
      className={cn("h-[22px] px-2 tabular-nums", resting, up ? "text-success-foreground" : "text-warning-foreground")}
    >
      <Icon aria-hidden data-icon="inline-start" />
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {text}
      <span className="sr-only"> on {against}</span>
    </Badge>
  );
}
