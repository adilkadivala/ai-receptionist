import { plans } from "@receptionist/product";
import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import { cn } from "@receptionist/ui/lib/utils";
import { contract, pricingCopy } from "@/content/home";
import { addOnSummary } from "@/lib/plans";
import { ContactLink, GetStartedLink } from "../cta-links";
import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { Section, SectionHeading } from "../section";

// Restyles the shared PlanCard to the approved mockup from the outside, so the block (and the dashboard) stay as
// they are: 28 px padding, 16 px corners, a 17 px name, a 48 px price, the badge in the blue tint, no footer band.
const planCardClassName = cn(
  "h-full gap-5 rounded-[16px] text-[15px] [--card-spacing:--spacing(7)]",
  "transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1",
  "**:data-[slot=card-title]:text-[17px] **:data-[slot=card-title]:font-semibold",
  "**:data-[slot=badge]:h-6 **:data-[slot=badge]:bg-brand-soft **:data-[slot=badge]:px-2.5 **:data-[slot=badge]:text-brand-soft-foreground",
  "[&_[data-slot=card-content]_.font-heading]:text-5xl [&_[data-slot=card-content]_.font-heading]:tracking-[-0.04em]",
  "[&_[data-slot=card-content]_p+p]:mt-5",
  "*:data-[slot=card-footer]:border-t-0 *:data-[slot=card-footer]:bg-transparent *:data-[slot=card-footer]:pt-0",
);

// The featured plan's soft blue glow.
const featuredClassName = "shadow-[0_24px_48px_-28px_color-mix(in_oklch,var(--primary)_45%,transparent)]";

export function Pricing() {
  return (
    <Section id="pricing" className="flex flex-col gap-10 border-t border-dashed border-frame">
      <SectionHeading
        align="center"
        eyebrow="Pricing"
        title={pricingCopy.title}
        description={pricingCopy.description}
      />
      <RevealGroup className="grid gap-4 md:grid-cols-3" stagger={0.1}>
        {plans.map((plan) => (
          <RevealItem key={plan.id}>
            <PlanCard
              plan={plan}
              className={cn(planCardClassName, plan.featured && featuredClassName)}
              action={
                <GetStartedLink
                  plan={plan.id}
                  variant={plan.featured ? "default" : "outline"}
                  size="md"
                  className="w-full shadow-none"
                >
                  Choose {plan.name}
                </GetStartedLink>
              }
            />
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="flex flex-wrap items-center justify-between gap-5 rounded-[16px] border bg-card px-5 py-6 sm:px-7">
        <div className="flex max-w-[720px] flex-col gap-1.5">
          <h3 className="text-[17px] font-semibold">{contract.title}</h3>
          <p className="text-[15px]/relaxed text-pretty text-foreground/70">{contract.description}</p>
        </div>
        <ContactLink />
      </Reveal>
      <p className="text-center text-sm text-pretty text-muted-foreground">Monthly add-ons: {addOnSummary}</p>
    </Section>
  );
}
