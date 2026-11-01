import { cn } from "@receptionist/ui/lib/utils";
import { builtFor } from "@/content/home";
import { RevealGroup, RevealItem } from "../motion/reveal";
import { eyebrowClassName, gutter } from "../section";

export function BuiltFor() {
  return (
    <section
      aria-labelledby="built-for"
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 border-b border-dashed border-frame bg-card py-7",
        gutter,
      )}
    >
      <h2 id="built-for" className={eyebrowClassName}>
        Built for
      </h2>
      <RevealGroup as="ul" stagger={0.06} className="flex flex-wrap justify-center gap-x-7 gap-y-2.5">
        {builtFor.map((name) => (
          <RevealItem as="li" key={name} className="text-[15px] font-medium text-foreground/80">
            {name}
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
