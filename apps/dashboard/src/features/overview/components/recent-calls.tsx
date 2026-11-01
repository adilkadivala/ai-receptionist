import { buttonVariants } from "@receptionist/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@receptionist/ui/components/card";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { PhoneIncoming } from "lucide-react";
import { Link } from "react-router";
import { EmptyState } from "../../../components/empty-state";
import { QueryError } from "../../../components/query-error";
import { formatRelative } from "../../../lib/format";
import { useRecentCalls } from "../../calls/api";
import { CallLink } from "../../calls/components/call-link";
import { OutcomeBadge } from "../../calls/components/outcome-badge";

const shown = 6;

/** The latest calls, each one tap from its transcript. */
export function RecentCalls() {
  const calls = useRecentCalls();
  // Blocked spam never reached the receptionist, so it isn't news here; the Calls page still lists it.
  const items = calls.data?.items.filter((call) => call.outcome !== "spam").slice(0, shown);

  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          Recent calls
        </CardTitle>
        <CardDescription>What your receptionist handled most recently.</CardDescription>
        <CardAction>
          <Link to="/calls" className={buttonVariants({ variant: "outline", size: "sm" })}>
            All calls
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        {calls.isError && <QueryError title="Couldn't load recent calls" onRetry={() => calls.refetch()} />}
        {calls.isPending && (
          <div className="flex flex-col gap-3">
            {Array.from({ length: shown }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have nothing else to key on
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        )}
        {items?.length === 0 && (
          <EmptyState icon={PhoneIncoming} title="No calls yet">
            When someone calls one of your numbers, it shows up here within seconds of hanging up.
          </EmptyState>
        )}
        {items && items.length > 0 && (
          <ul className="-mx-2 flex flex-col">
            {items.map((call) => (
              <li
                key={call.id}
                className="relative flex items-center gap-3 rounded-md px-2 py-2.5 hover:bg-muted/50 [&+&]:border-t"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <CallLink call={call} />
                    <time dateTime={call.started_at} className="shrink-0 text-xs text-muted-foreground">
                      {formatRelative(call.started_at)}
                    </time>
                  </div>
                  <p className="truncate text-muted-foreground">{call.summary}</p>
                </div>
                <OutcomeBadge outcome={call.outcome} className="hidden sm:inline-flex" />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
