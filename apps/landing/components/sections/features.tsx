import { addOns, formatUsd, languageCount } from "@receptionist/product";
import { Badge } from "@receptionist/ui/components/badge";
import {
  CalendarCheck,
  FileText,
  Languages,
  LifeBuoy,
  type LucideIcon,
  MessageSquareText,
  Mic,
  PhoneForwarded,
  ShieldBan,
} from "lucide-react";
import { type FeatureId, features } from "@/content/home";
import { FeatureItem } from "../feature-item";
import { Section, SectionHeading } from "../section";

const icons: Record<FeatureId, LucideIcon> = {
  booking: CalendarCheck,
  transfer: PhoneForwarded,
  messages: MessageSquareText,
  summaries: FileText,
  spam: ShieldBan,
  languages: Languages,
  fallback: LifeBuoy,
  voice: Mic,
};

function addOnBadge(id: string) {
  const addOn = addOns.find((item) => item.id === id);
  return addOn && <Badge variant="secondary">Add-on · {formatUsd(addOn.price)}/month</Badge>;
}

export function Features() {
  return (
    <Section id="features">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <SectionHeading
          eyebrow="Features"
          title="A front desk that never misses a call"
          description={`Everything below comes with every plan, in all ${languageCount} languages, except your own voice.`}
          className="lg:sticky lg:top-24 lg:self-start"
        />
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {features.map((feature) => (
            <FeatureItem
              key={feature.id}
              icon={icons[feature.id]}
              title={feature.title}
              badge={"addOnId" in feature ? addOnBadge(feature.addOnId) : undefined}
            >
              {feature.description}
            </FeatureItem>
          ))}
        </div>
      </div>
    </Section>
  );
}
