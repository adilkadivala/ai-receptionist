import { cn } from "@receptionist/ui/lib/utils";
import { steps } from "@/content/home";
import { brandText, gutter, SectionHeading } from "../section";

export function HowItWorks() {
  return (
    <section id="how" className="border-t border-dashed border-frame">
      <div className={cn("pt-18 pb-10", gutter)}>
        <SectionHeading eyebrow="How it works" title="Live in three steps" className="max-w-160" />
      </div>
      {/* gap-px over the border colour draws the lines between cells, at any number of columns. */}
      <ol className="grid gap-px border-y bg-border md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex flex-col gap-3 bg-card px-6 pt-8 pb-10">
            <span className={cn("font-mono text-[13px]", brandText)}>{String(index + 1).padStart(2, "0")}</span>
            <h3 className="text-[19px] font-semibold tracking-[-0.015em]">{step.title}</h3>
            <p className="text-[15px]/relaxed text-pretty text-foreground/70">{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
