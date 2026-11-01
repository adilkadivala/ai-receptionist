import { useSidebar } from "@receptionist/ui/components/sidebar";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { Link } from "react-router";
import { glass } from "../../../components/surfaces";
import { UsageBar } from "../../../components/usage-meter";
import { formatNumber, formatShortDate } from "../../../lib/format";
import { usePlanUsage } from "../api";

/** Minutes this billing month, on clear glass at the foot of the sidebar. Opens Billing. */
export function SidebarUsage() {
  const { usage, rollup } = usePlanUsage();
  const { setOpenMobile } = useSidebar();

  if (!usage || !rollup) return <Skeleton className="h-[92px] rounded-xl bg-sidebar-accent" />;

  return (
    <Link
      to="/billing"
      onClick={() => setOpenMobile(false)}
      className={cn(
        "flex flex-col gap-2.5 rounded-xl p-3.5 outline-none transition-colors hover:bg-primary-foreground/14 focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        glass,
      )}
    >
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium">Minutes this month</span>
        <span className="font-mono text-xs text-sidebar-foreground/60 tabular-nums">{usage.percent}%</span>
      </span>
      <UsageBar usage={usage} onInk />
      <span className="text-xs text-sidebar-foreground/60 tabular-nums">
        {formatNumber(usage.used)} of {formatNumber(usage.included)} used · resets {formatShortDate(rollup.period_end)}
      </span>
    </Link>
  );
}
