import { finalCta } from "@/content/home";
import { Blueprint } from "../blueprint";
import { ctaClassName, GetStartedLink } from "../cta-links";
import { DeskProps } from "../desk-props";
import { RevealGroup, RevealItem } from "../motion/reveal";

/** The page's last word, on the same blueprint as the hero. */
export function FinalCta() {
  return (
    <section aria-labelledby="final-cta-title" className="px-2 pb-24 sm:px-3">
      <div className="relative overflow-hidden rounded-[20px] bg-(--ink) px-6 py-24 text-center text-primary-foreground sm:rounded-[28px] sm:py-32">
        <Blueprint />
        <DeskProps variant="closing" />
        <RevealGroup stagger={0.1} className="relative">
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
            className="mx-auto mt-[18px] max-w-[520px] text-[17px]/relaxed text-pretty text-primary-foreground/72"
          >
            {finalCta.description}
          </RevealItem>
          <RevealItem className="mt-8 flex flex-wrap justify-center gap-3">
            <GetStartedLink variant="inverse" arrow />
            <a href="#pricing" className={ctaClassName({ variant: "glass" })}>
              See pricing
            </a>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
