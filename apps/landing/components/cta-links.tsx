import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowRight, Play } from "lucide-react";
import type { ReactNode } from "react";
import { bookDemoHref, contactHref } from "@/lib/site";

// Link sizes from the design: 46 px for the hero and the final call to action, 42 px in cards, 36 px in the header.
const sizes = {
  lg: "h-[46px] gap-2 rounded-[12px] px-5 text-[15px]",
  md: "h-[42px] gap-2 px-[18px]",
  sm: "h-9 px-3.5",
};

const variants = {
  // Signal blue, lit from above.
  default: "shadow-[inset_0_1px_0_color-mix(in_oklch,white_22%,transparent),var(--raised)]",
  // White on the grey page, resting on it.
  outline: "border-transparent bg-card text-foreground shadow-(--raised)",
  // On the blueprint (hero, final call to action): white with blueprint text, and clear glass beside it.
  inverse:
    "bg-primary-foreground text-(color:--ink) shadow-[0_8px_24px_-10px_black] hover:bg-primary-foreground/90 focus-visible:ring-primary-foreground/40",
  glass:
    "border-primary-foreground/15 bg-primary-foreground/8 text-primary-foreground backdrop-blur-sm hover:bg-primary-foreground/14 focus-visible:ring-primary-foreground/40",
};

// Moves 2 px toward where the link goes when the link is hovered.
const arrowClassName =
  "transition-transform duration-200 ease-out rtl:rotate-180 group-hover/cta:translate-x-0.5 rtl:group-hover/cta:-translate-x-0.5";

export type CtaProps = {
  className?: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children?: ReactNode;
};

export function ctaClassName({ variant = "default", size = "lg", className }: CtaProps = {}) {
  // The blueprint variants restyle the shared default button.
  const base = variant === "outline" ? "outline" : "default";
  return cn(buttonVariants({ variant: base }), "group/cta", sizes[size], variants[variant], className);
}

/** The page's one main action, the same label everywhere. A plan card passes its plan, so sales knows which one. */
export function BookDemoLink({
  plan,
  arrow,
  children = "Book a demo",
  ...props
}: CtaProps & { plan?: string; arrow?: boolean }) {
  return (
    <a href={bookDemoHref(plan)} className={ctaClassName(props)}>
      {children}
      {arrow && <ArrowRight aria-hidden className={arrowClassName} />}
    </a>
  );
}

/** Jumps to the live call demo, which starts with sound when it has recordings. */
export function HearCallLink(props: CtaProps) {
  return (
    <a href="#listen" className={ctaClassName({ variant: "outline", ...props })}>
      <Play aria-hidden className="size-3.5 fill-current" />
      Hear a live call
    </a>
  );
}

/** Large contracts: write to sales. */
export function ContactLink({ children = "Talk to us", ...props }: CtaProps) {
  return (
    <a href={contactHref} className={ctaClassName({ variant: "outline", size: "md", ...props })}>
      {children}
      <ArrowRight aria-hidden className={cn("size-[15px]", arrowClassName)} />
    </a>
  );
}
