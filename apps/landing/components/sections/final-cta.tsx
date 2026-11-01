import { finalCta } from "@/content/home";
import { ctaClassName, GetStartedLink } from "../cta-links";
import { DitherBand } from "../dither-band";
import { RevealGroup, RevealItem } from "../motion/reveal";
import { gutter } from "../section";

export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className={`pb-24 ${gutter}`}>
      <div className="overflow-hidden rounded-[24px] border bg-hero px-6 pt-18 text-center">
        <RevealGroup stagger={0.1}>
          <RevealItem>
            <h2
              id="final-cta-title"
              className="mx-auto max-w-[720px] text-[clamp(2.125rem,5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.045em] text-balance"
            >
              {finalCta.title}
            </h2>
          </RevealItem>
          <RevealItem
            as="p"
            className="mx-auto mt-[18px] max-w-[520px] text-[17px]/relaxed text-pretty text-foreground/70"
          >
            {finalCta.description}
          </RevealItem>
          <RevealItem className="mt-7 flex flex-wrap justify-center gap-3">
            <GetStartedLink />
            <a href="#pricing" className={ctaClassName({ variant: "outline" })}>
              See pricing
            </a>
          </RevealItem>
        </RevealGroup>
        <DitherBand className="-mx-6 mt-14 h-[120px]" rowClassName="h-3.5" />
      </div>
    </section>
  );
}
