import { Globe, Lock, type LucideIcon, PhoneCall, ShieldCheck } from "lucide-react";
import { type TrustId, trust } from "@/content/home";
import { RevealGroup, RevealItem } from "../motion/reveal";

const icons: Record<TrustId, LucideIcon> = {
  disclosure: PhoneCall,
  emergencies: ShieldCheck,
  hipaa: Lock,
  region: Globe,
};

export function Trust() {
  return (
    <section aria-labelledby="trust-title" className="border-y">
      <h2 id="trust-title" className="sr-only">
        Trust and safety
      </h2>
      {/* gap-px over the border colour draws the lines between cells. */}
      <RevealGroup as="ul" stagger={0.09} className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
        {trust.map((item) => {
          const Icon = icons[item.id];
          return (
            <li key={item.id} className="bg-card px-6 py-8">
              <RevealItem className="flex flex-col gap-2.5">
                <Icon aria-hidden className="size-5 text-primary" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm/relaxed text-pretty text-foreground/70">{item.description}</p>
              </RevealItem>
            </li>
          );
        })}
      </RevealGroup>
    </section>
  );
}
