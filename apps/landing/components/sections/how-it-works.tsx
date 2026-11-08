import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";
import { steps } from "@/content/home";
import { BookDemoLink, HearCallLink } from "../cta-links";
import { HatchBand, type PatternKind } from "../drafting";
import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { brandText, gutter, SectionHeading } from "../section";
import { StageCell } from "../stage-cell";
import { BusinessArt, ForwardingArt, SummaryArt } from "../step-art";

// One picture and stage pattern per step, in order.
const art: { picture: ReactNode; pattern: PatternKind }[] = [
  { picture: <ForwardingArt />, pattern: "grid" },
  { picture: <BusinessArt />, pattern: "hex" },
  { picture: <SummaryArt />, pattern: "chevron" },
];

export function HowItWorks() {
  return (
    <section id="how">
      <div className={cn("flex flex-wrap items-end justify-between gap-x-10 gap-y-7 pt-24 pb-14", gutter)}>
        <SectionHeading eyebrow="How it works" title="Live in three steps" className="max-w-160" />
        <Reveal delay={0.1} className="flex flex-wrap gap-3">
          <BookDemoLink arrow />
          <HearCallLink />
        </Reveal>
      </div>
      <HatchBand />
      {/* gap-px over the border colour draws the lines between cells, at any number of columns. */}
      <RevealGroup as="ol" stagger={0.12} className="grid gap-px border-b bg-border md:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.title} className="bg-background">
            <RevealItem className="h-full">
              <StageCell
                pattern={art[index]?.pattern ?? "grid"}
                stageClassName="min-h-[264px]"
                title={
                  <span className="flex items-baseline gap-2.5">
                    <span className={cn("font-mono text-[13px] font-normal", brandText)}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {step.title}
                  </span>
                }
                description={step.description}
              >
                {art[index]?.picture}
              </StageCell>
            </RevealItem>
          </li>
        ))}
      </RevealGroup>
    </section>
  );
}
