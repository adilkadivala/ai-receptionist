import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** One headline number. `hint` says what it's counted against; `children` holds a meter or a link. */
export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  loading,
  children,
}: {
  label: string;
  value: ReactNode;
  icon?: LucideIcon;
  hint?: ReactNode;
  loading?: boolean;
  children?: ReactNode;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle className="font-normal text-muted-foreground">{label}</CardTitle>
        {Icon && (
          <CardAction>
            <Icon aria-hidden className="size-4 text-muted-foreground" />
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2">
        {loading ? (
          <>
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-4 w-32" />
          </>
        ) : (
          <>
            <p className="font-heading text-3xl font-semibold tabular-nums">{value}</p>
            {hint && <p className="text-muted-foreground">{hint}</p>}
            {children}
          </>
        )}
      </CardContent>
    </Card>
  );
}
