import { Badge } from "@receptionist/ui/components/badge";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { Link } from "react-router";
import { PageHeader } from "../../../components/page-header";
import { formatLongDate, formatNumber } from "../../../lib/format";
import { useAccount } from "../../account/api";
import { useCallsToday } from "../../calls/api";
import { usePhoneNumbers } from "../../numbers/api";

function partOfDay(hour: number) {
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

/** Whether calls reach a receptionist: at least one number has one. */
function AnsweringStatus() {
  const numbers = usePhoneNumbers();
  if (!numbers.data) return <Skeleton className="h-7 w-36 rounded-full" />;
  const answering = numbers.data.some((number) => number.agent_id);

  return answering ? (
    <Badge className="h-7 gap-1.5 border-transparent bg-success-soft px-2.5 text-[13px] text-success-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      Answering calls
    </Badge>
  ) : (
    <Badge
      render={<Link to="/numbers" />}
      className="h-7 gap-1.5 border-transparent bg-warning-soft px-2.5 text-[13px] text-warning-foreground"
    >
      <span aria-hidden className="size-1.5 rounded-full bg-warning" />
      Not answering: no number has a receptionist
    </Badge>
  );
}

/** Today's date, "Good evening, Ana", today's calls in a sentence, and whether the receptionist is answering. */
export function Greeting() {
  const account = useAccount();
  const today = useCallsToday().data;
  const firstName = account.data?.user.name.split(" ")[0];

  return (
    <PageHeader
      eyebrow={formatLongDate(new Date())}
      title={firstName ? `Good ${partOfDay(new Date().getHours())}, ${firstName}` : <Skeleton className="h-8 w-56" />}
      actions={<AnsweringStatus />}
    >
      {today ? (
        <>
          {today.answered === 0
            ? "No calls yet today."
            : `Your receptionist answered ${formatNumber(today.answered)} ${today.answered === 1 ? "call" : "calls"} today.`}{" "}
          {today.messages > 0 && (
            <Link
              to="/calls?outcome=message&range=today"
              className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              {today.messages} {today.messages === 1 ? "needs a callback" : "need a callback"}.
            </Link>
          )}
        </>
      ) : (
        " "
      )}
    </PageHeader>
  );
}
