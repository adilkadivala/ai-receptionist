import { BedDouble, Building2, Hospital, type LucideIcon, Scale, Scissors, Stethoscope, Wrench } from "lucide-react";
import { type BusinessKind, builtFor } from "@/content/home";
import { RevealGroup, RevealItem } from "../motion/reveal";

const icons: Record<BusinessKind, LucideIcon> = {
  trades: Wrench,
  salons: Scissors,
  clinics: Stethoscope,
  law: Scale,
  hotels: BedDouble,
  hospitals: Hospital,
  branches: Building2,
};

// A hairline that fades in toward the title, flipped for the other side.
const fadeLine = "h-px max-w-40 flex-1 bg-border [mask-image:linear-gradient(90deg,transparent,black)]";

/**
 * The sheet that curves up over the hero's bottom edge, with the kinds of business it's built for in one segmented
 * tray (each its own pill on smaller screens). No customer logos until there are real ones (DESIGN.md).
 */
export function BuiltFor() {
  return (
    <section
      aria-labelledby="built-for"
      className="relative z-10 mx-2 -mt-12 rounded-t-[32px] bg-background px-4 pt-9 pb-14 sm:mx-3 sm:-mt-[72px] sm:rounded-t-[56px] sm:px-6 sm:pt-11"
    >
      <div className="flex items-center justify-center gap-3 text-muted-foreground">
        <span aria-hidden className={fadeLine} />
        <Chevrons />
        <h2 id="built-for" className="text-center text-sm text-foreground/80">
          {builtFor.title}
        </h2>
        <Chevrons className="-scale-x-100" />
        <span aria-hidden className={`${fadeLine} -scale-x-100`} />
      </div>

      <div className="relative mt-6">
        {/* The guide line the tray sits on, with a dot at each end. */}
        <div aria-hidden className="absolute inset-x-0 top-1/2 hidden h-px bg-border lg:block">
          <span className="absolute -top-[2.5px] start-0 size-1.5 rounded-full bg-frame" />
          <span className="absolute -top-[2.5px] end-0 size-1.5 rounded-full bg-frame" />
        </div>
        <RevealGroup
          as="ul"
          stagger={0.05}
          className="relative mx-auto flex w-fit max-w-full flex-wrap justify-center gap-2 lg:flex-nowrap lg:gap-0 lg:rounded-full lg:bg-card lg:p-1 lg:shadow-(--raised)"
        >
          {builtFor.kinds.map((kind) => {
            const Icon = icons[kind.id];
            return (
              <RevealItem
                as="li"
                key={kind.id}
                className="flex h-10 items-center gap-2 rounded-full bg-card px-4 text-[15px] font-medium text-foreground/85 shadow-(--raised) lg:h-11 lg:rounded-none lg:border-s lg:px-5 lg:shadow-none lg:first:border-s-0"
              >
                <Icon aria-hidden className="size-4 text-primary" strokeWidth={1.75} />
                {kind.name}
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}

/** Two small inward chevrons beside the title, like the arrows on a dimension line. */
function Chevrons({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 14 10" className={`h-2.5 w-3.5 shrink-0 ${className ?? ""}`} fill="currentColor">
      <path d="M0 0L6 5L0 10Z M7 0L13 5L7 10Z" opacity="0.7" />
    </svg>
  );
}
