import { findPlan, formatUsd, languageCount, overagePerMinute, plans } from "@receptionist/product";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@receptionist/ui/components/accordion";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@receptionist/ui/components/sheet";
import { SidebarMenuButton, useSidebar } from "@receptionist/ui/components/sidebar";
import { CircleHelp } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { useSubscription } from "../features/billing/api";
import { navItemClassName } from "./nav-main";

function InlineLink({ to, onNavigate, children }: { to: string; onNavigate: () => void; children: ReactNode }) {
  return (
    <Link to={to} onClick={onNavigate} className="font-medium text-primary underline-offset-4 hover:underline">
      {children}
    </Link>
  );
}

/** Quick answers for owners, opened from the sidebar. Every fact here comes from @receptionist/product. */
export function HelpSheet() {
  const { setOpenMobile } = useSidebar();
  const plan = findPlan(useSubscription().data?.plan);
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    setOpenMobile(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<SidebarMenuButton className={navItemClassName} />}>
        <CircleHelp />
        <span>Help</span>
      </SheetTrigger>
      <SheetContent className="gap-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b pe-12">
          <SheetTitle>Help</SheetTitle>
          <SheetDescription>Short answers to what owners ask most.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <Accordion>
            <AccordionItem value="hear">
              <AccordionTrigger>How do I hear my receptionist?</AccordionTrigger>
              <AccordionContent>
                Choose Make a test call at the top of the sidebar, then ring the number it shows from any phone. It
                answers exactly as it would for a customer.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="change">
              <AccordionTrigger>How do I change what it says?</AccordionTrigger>
              <AccordionContent>
                On the{" "}
                <InlineLink to="/agent" onNavigate={close}>
                  Receptionist
                </InlineLink>{" "}
                page you can edit the greeting, your business details and opening hours, the questions it can answer,
                and who it transfers urgent calls to. Saved changes apply to the next call.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="languages">
              <AccordionTrigger>Which languages does it speak?</AccordionTrigger>
              <AccordionContent>
                {languageCount} languages. It hears which language the caller speaks and answers in it, and it can
                follow callers who mix two, such as Hindi and English.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="minutes">
              <AccordionTrigger>What if I use more minutes than my plan has?</AccordionTrigger>
              <AccordionContent>
                {plan
                  ? `The ${plan.name} plan includes ${plan.minutes} minutes a month.`
                  : `Plans include ${plans.map((option) => option.minutes).join(", ")} minutes a month.`}{" "}
                Each minute past that costs {formatUsd(overagePerMinute)}.{" "}
                <InlineLink to="/billing" onNavigate={close}>
                  Billing
                </InlineLink>{" "}
                shows how many you've used and lets you change plan.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="spam">
              <AccordionTrigger>Why is a call marked spam?</AccordionTrigger>
              <AccordionContent>
                Spam blocking comes with every plan and stops robocalls and sales pitches. Blocked calls still appear
                under Spam on the{" "}
                <InlineLink to="/calls?outcome=spam" onNavigate={close}>
                  Calls
                </InlineLink>{" "}
                page, so you can check nothing real was caught.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </SheetContent>
    </Sheet>
  );
}
