import { addOns, contractFromPerMinute, formatUsd, included, overagePerMinute, plans } from "@receptionist/product";
import { PlanCard } from "@receptionist/ui/blocks/plan-card";
import { cn } from "@receptionist/ui/lib/utils";
import { contractFeatures } from "@/content/home";
import { CheckList } from "../check-list";
import { ctaClassName, GetStartedLink, TalkToSalesLink } from "../cta-links";
import { brandText, Eyebrow, Section, SectionHeading } from "../section";

export function Pricing() {
  return (
    <Section id="pricing" muted>
      <SectionHeading
        eyebrow="Pricing"
        title="Simple monthly plans"
        description={`Pick a plan by how many call minutes you need. Extra minutes are ${formatUsd(overagePerMinute)} each.`}
      />
      <h3 className="sr-only">Every plan includes</h3>
      <CheckList items={included} className="mt-8 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3" />

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            action={
              <GetStartedLink plan={plan.id} variant={plan.featured ? "default" : "outline"} className="h-10 w-full">
                Choose {plan.name}
              </GetStartedLink>
            }
          />
        ))}
      </div>

      <div className="mt-16">
        <h3 className="text-lg font-medium">Add-ons</h3>
        <ul className="mt-4 grid gap-px overflow-hidden rounded-xl bg-foreground/10 ring-1 ring-foreground/10 sm:grid-cols-2 lg:grid-cols-4">
          {addOns.map((addOn) => (
            <li key={addOn.id} className="bg-card p-5">
              <p className="font-medium">{addOn.name}</p>
              <p className={cn("mt-1 font-mono text-sm", brandText)}>
                {addOn.from && "from "}
                {formatUsd(addOn.price)}/month
              </p>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">{addOn.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-16 grid gap-8 rounded-xl bg-card p-6 ring-1 ring-foreground/10 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <div>
          <Eyebrow>Hotels, hospitals and large companies</Eyebrow>
          <h3 className="mt-3 font-heading text-2xl font-semibold tracking-tight">
            Per minute, from {formatUsd(contractFromPerMinute)}
          </h3>
          <CheckList items={contractFeatures} className="mt-5 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2" />
        </div>
        <TalkToSalesLink variant="default" className={ctaClassName} />
      </div>
    </Section>
  );
}
