import { plans } from "@receptionist/product";
import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import { cn } from "@receptionist/ui/lib/utils";
import { contract, pricingCopy } from "@/content/home";
import { addOnSummary } from "@/lib/plans";
import { BookDemoLink, ContactLink } from "../cta-links";
import { FrameRule } from "../frame-lines";
import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { Section, SectionHeading } from "../section";

// The shared PlanCard is drawn to the approved mockup; here it also lifts on hover.
const planCardClassName = "h-full transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-1";

// The featured plan keeps the shared blue ring and swaps its shadow for a soft blue glow.
const featuredClassName =
  "shadow-[0_2px_4px_-1px_color-mix(in_oklch,var(--primary)_20%,transparent),0_28px_56px_-24px_color-mix(in_oklch,var(--primary)_50%,transparent)]";

export function Pricing() {
  return (
    <Section id="pricing" className="relative flex flex-col gap-10">
      <FrameRule />
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
                <BookDemoLink
                  plan={plan.id}
                  variant={plan.featured ? "default" : "outline"}
                  size="md"
                  className="w-full shadow-none"
                >
                  Choose {plan.name}
                </BookDemoLink>
              }
            />
          </RevealItem>
        ))}
      </RevealGroup>
      <Reveal className="flex flex-wrap items-center justify-between gap-5 rounded-[16px] bg-card px-5 py-6 shadow-(--raised) sm:px-7">
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
