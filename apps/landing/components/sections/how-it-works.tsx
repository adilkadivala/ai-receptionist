import { cn } from "@receptionist/ui/lib/utils";
import { steps } from "@/content/home";
import { brandText, Section, SectionHeading } from "../section";

export function HowItWorks() {
  return (
    <Section id="how-it-works" muted>
      <SectionHeading eyebrow="How it works" title="Answering calls in three steps" />
      <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
        {steps.map((step, index) => (
          <li key={step.title} className="border-t-2 border-foreground/10 pt-6 first:border-primary">
            <p className={cn("font-mono text-sm font-medium tabular-nums", brandText)}>
              <span className="sr-only">Step </span>
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-3 text-lg font-medium">{step.title}</h3>
            <p className="mt-2 text-pretty text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
