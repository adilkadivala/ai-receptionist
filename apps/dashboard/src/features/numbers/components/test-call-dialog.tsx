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
import { cn } from "@receptionist/ui/lib/utils";
import { Phone, PhoneCall } from "lucide-react";
import { Link } from "react-router";
import { raised } from "../../../components/surfaces";
import { formatPhone } from "../../../lib/format";
import { usePhoneNumbers } from "../api";

/**
 * The sidebar's main button, white on the blueprint like the landing's "Get started": the numbers to ring to hear the
 * receptionist as a customer would.
 */
export function TestCallDialog() {
  const numbers = usePhoneNumbers();
  const answered = numbers.data?.filter((number) => number.agent_id);

  return (
    <Dialog>
      <DialogTrigger
        render={
          <SidebarMenuButton className="h-9 justify-center rounded-lg bg-primary-foreground font-medium text-(color:--ink) shadow-[0_8px_24px_-10px_black] hover:bg-primary-foreground/90 hover:text-(color:--ink) active:bg-primary-foreground/90 active:text-(color:--ink)" />
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
              <li key={number.id} className={cn("flex items-center justify-between gap-3 p-3", raised)}>
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
