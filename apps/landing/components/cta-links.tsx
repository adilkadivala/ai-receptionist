import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import { salesEmail, signupUrl } from "@/lib/site";

// Large calls to action: 44 px tall, so they're easy to tap.
export const ctaClassName = "h-11 px-5 text-base";

type LinkProps = {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  children?: ReactNode;
};

/** The page's one main action. The label is the same everywhere. */
export function GetStartedLink({
  className,
  variant = "default",
  plan,
  children = "Get started",
}: LinkProps & { plan?: string }) {
  return (
    <a href={signupUrl(plan)} className={cn(buttonVariants({ variant }), className)}>
      {children}
      <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
    </a>
  );
}

export function TalkToSalesLink({ className, variant = "outline", children = "Talk to sales" }: LinkProps) {
  return (
    <a href={`mailto:${salesEmail}`} className={cn(buttonVariants({ variant }), className)}>
      {children}
    </a>
  );
}
