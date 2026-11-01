import { Globe, Lock, type LucideIcon, PhoneCall, ShieldCheck } from "lucide-react";
import { type TrustId, trust } from "@/content/home";
import { HatchBand, type PatternKind } from "../drafting";
import { Medal } from "../medal";
import { RevealGroup, RevealItem } from "../motion/reveal";
import { brandText, gutter, SectionHeading } from "../section";
import { StageCell } from "../stage-cell";

const art: Record<TrustId, { icon: LucideIcon; pattern: PatternKind }> = {
  disclosure: { icon: PhoneCall, pattern: "hex" },
  emergencies: { icon: ShieldCheck, pattern: "chevron" },
  hipaa: { icon: Lock, pattern: "grid" },
  region: { icon: Globe, pattern: "hex" },
};

/** What every call can count on, each promise a medal on its own stage. */
export function Trust() {
  return (
    <section aria-labelledby="trust-title">
      <div className={`pt-24 pb-14 ${gutter}`}>
        <SectionHeading
          align="center"
          eyebrow="Trust"
          title={<span id="trust-title">Safe for every caller</span>}
          description="Honest with callers, careful with patients, and clear about where data lives."
        />
      </div>
      <HatchBand />
      {/* gap-px over the border colour draws the lines between cells. */}
      <RevealGroup as="ul" stagger={0.09} className="grid gap-px border-b bg-border sm:grid-cols-2 lg:grid-cols-4">
        {trust.map((item) => {
          const { icon: Icon, pattern } = art[item.id];
          return (
            <li key={item.id} className="group bg-background">
              <RevealItem className="h-full">
                <StageCell
                  pattern={pattern}
                  align="center"
                  stageClassName="justify-start pt-0 pb-12"
                  title={
                    <span className="inline-flex items-center gap-2">
                      <Icon aria-hidden className={`size-4 ${brandText}`} />
                      {item.title}
                    </span>
                  }
                  description={item.description}
                >
                  <Medal icon={Icon} />
                </StageCell>
              </RevealItem>
            </li>
          );
        })}
      </RevealGroup>
    </section>
  );
}
