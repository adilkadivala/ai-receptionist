import { buttonVariants } from "@receptionist/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@receptionist/ui/components/dialog";
import { SidebarMenuButton } from "@receptionist/ui/components/sidebar";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { Phone, PhoneCall } from "lucide-react";
import { Link } from "react-router";
import { formatPhone } from "../../../lib/format";
import { usePhoneNumbers } from "../api";

/** The sidebar's main button: the numbers to ring to hear the receptionist as a customer would. */
export function TestCallDialog() {
  const numbers = usePhoneNumbers();
  const answered = numbers.data?.filter((number) => number.agent_id);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <SidebarMenuButton className="h-9 justify-center bg-primary font-medium text-primary-foreground shadow-xs hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground" />
        }
      >
        <PhoneCall />
        <span>Make a test call</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Make a test call</DialogTitle>
          <DialogDescription>
            Ring your number from any phone. Your receptionist answers exactly as it would for a customer, so you can
            hear the greeting and try a booking.
          </DialogDescription>
        </DialogHeader>
        {numbers.isPending && <Skeleton className="h-14" />}
        {answered?.length === 0 && (
          <p className="text-muted-foreground">
            None of your numbers has a receptionist yet.{" "}
            <Link to="/numbers" className="font-medium text-primary underline-offset-4 hover:underline">
              Choose one on Phone numbers
            </Link>
            .
          </p>
        )}
        {answered && answered.length > 0 && (
          <ul className="flex flex-col gap-2">
            {answered.map((number) => (
              <li key={number.id} className="flex items-center justify-between gap-3 rounded-xl border p-3">
                <span className="flex min-w-0 flex-col">
                  <span className="font-mono text-base font-medium tabular-nums">{formatPhone(number.e164)}</span>
                  {number.label && <span className="text-xs text-muted-foreground">{number.label}</span>}
                </span>
                <a href={`tel:${number.e164}`} className={buttonVariants({ size: "lg" })}>
                  <Phone data-icon="inline-start" />
                  Call
                </a>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
