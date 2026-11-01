import { Badge } from "@receptionist/ui/components/badge";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

/**
 * dashboard-01's section card: a label, a badge, one big number and a line on what it's counted against.
 * `children` sits under the number, e.g. a usage bar.
 */
export function StatCard({
  label,
  value,
  badge,
  hint,
  loading,
  children,
}: {
  label: string;
  value: ReactNode;
  badge?: ReactNode;
  hint?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Card className="gap-3 bg-linear-to-b from-card to-muted/25 py-4.5 shadow-xs [--card-spacing:--spacing(4.5)] dark:to-card">
      <CardHeader>
        <CardDescription className="text-[13px]">{label}</CardDescription>
        {badge && !loading && <CardAction>{badge}</CardAction>}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {loading ? (
          <>
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-4 w-40" />
          </>
        ) : (
          <>
            <p className="text-[32px] leading-none font-semibold tracking-[-0.035em] tabular-nums">{value}</p>
            {children}
            {hint && <p className="mt-auto text-[13px] text-muted-foreground">{hint}</p>}
          </>
        )}
      </CardContent>
    </Card>
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
      className={cn("h-[22px] px-2 tabular-nums", up ? "text-success-foreground" : "text-warning-foreground")}
    >
      <Icon aria-hidden data-icon="inline-start" />
      <span className="sr-only">{up ? "Up" : "Down"} </span>
      {text}
      <span className="sr-only"> on {against}</span>
    </Badge>
  );
}
