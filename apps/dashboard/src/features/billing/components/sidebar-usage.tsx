import { useSidebar } from "@receptionist/ui/components/sidebar";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { Link } from "react-router";
import { UsageBar } from "../../../components/usage-meter";
import { formatNumber, formatShortDate } from "../../../lib/format";
import { usePlanUsage } from "../api";

/** Minutes this billing month, at the foot of the sidebar. Opens Billing. */
export function SidebarUsage() {
  const { usage, rollup } = usePlanUsage();
  const { setOpenMobile } = useSidebar();

  if (!usage || !rollup) return <Skeleton className="h-[92px] rounded-xl" />;

  return (
    <Link
      to="/billing"
      onClick={() => setOpenMobile(false)}
      className="flex flex-col gap-2.5 rounded-xl border bg-card p-3.5 shadow-xs outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium">Minutes this month</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{usage.percent}%</span>
      </span>
      <UsageBar usage={usage} />
      <span className="text-xs text-muted-foreground tabular-nums">
        {formatNumber(usage.used)} of {formatNumber(usage.included)} used · resets {formatShortDate(rollup.period_end)}
      </span>
    </Link>
  );
}
