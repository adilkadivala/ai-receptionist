import { Badge } from "@receptionist/ui/components/badge";
import { BriefcaseBusiness, Building, Hospital, Hotel, type LucideIcon, Wrench } from "lucide-react";
import { type SegmentId, segments } from "@/content/segments";
import { Section, SectionHeading } from "../section";

const icons: Record<SegmentId, LucideIcon> = {
  "small-business": Wrench,
  "business-people": BriefcaseBusiness,
  hotels: Hotel,
  hospitals: Hospital,
  companies: Building,
};

export function WhoItsFor() {
  return (
    <Section id="who" muted>
      <SectionHeading
        eyebrow="Who it's for"
        title="Built for every size of business"
        description="Small businesses and business people sign up for a monthly plan. Hotels, hospitals and large companies get a contract with the integrations they need."
      />
      <ul className="mt-12 divide-y border-y">
        {segments.map((segment) => {
          const Icon = icons[segment.id];
          return (
            <li
              key={segment.id}
              className="grid gap-x-8 gap-y-2 py-6 md:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] md:items-baseline lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_7rem]"
            >
              <div>
                <h3 className="flex items-center gap-2.5 font-medium">
                  <Icon className="size-5 shrink-0 self-center text-primary" aria-hidden />
                  {segment.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground md:ps-7.5">{segment.examples}</p>
              </div>
              <p className="text-pretty">{segment.does}</p>
              <div className="md:col-start-2 lg:col-start-auto lg:justify-self-end">
                <Badge variant={segment.buys === "Contract" ? "outline" : "secondary"}>{segment.buys}</Badge>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
