import { BotMessageSquare, Globe, HeartPulse, type LucideIcon, ShieldCheck } from "lucide-react";
import { type TrustId, trust, trustAlso } from "@/content/home";
import { CheckList } from "../check-list";
import { FeatureItem } from "../feature-item";
import { Section, SectionHeading } from "../section";

const icons: Record<TrustId, LucideIcon> = {
  disclosure: BotMessageSquare,
  medical: HeartPulse,
  hipaa: ShieldCheck,
  region: Globe,
};

export function Trust() {
  return (
    <Section id="trust">
      <SectionHeading
        eyebrow="Trust and safety"
        title="Honest with callers, careful with their data"
        description="What every caller can count on, and what hospitals and large companies get on a contract."
      />
      <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2">
        {trust.map((item) => (
          <FeatureItem key={item.id} icon={icons[item.id]} title={item.title}>
            {item.description}
          </FeatureItem>
        ))}
      </div>
      <CheckList
        items={trustAlso}
        className="mt-12 grid gap-x-6 gap-y-2 rounded-xl bg-muted/50 p-5 text-sm sm:grid-cols-2 sm:p-6"
      />
    </Section>
  );
}
