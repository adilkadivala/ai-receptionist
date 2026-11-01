import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@receptionist/ui/components/accordion";
import { cn } from "@receptionist/ui/lib/utils";
import { faq } from "@/content/faq";
import { contactHref } from "@/lib/site";
import { Reveal } from "../motion/reveal";
import { brandText, Eyebrow, Section } from "../section";

// A plus or minus in Geist Mono in place of shadcn's chevrons, following the trigger's open state.
const sign = "ms-auto font-mono text-lg font-normal text-muted-foreground";

export function Faq() {
  return (
    <Section id="faq" className="flex flex-wrap gap-12">
      <Reveal className="flex min-w-0 flex-[1_1_280px] flex-col gap-3.5">
        <Eyebrow>FAQ</Eyebrow>
        <h2 className="text-[clamp(2rem,4vw,2.5rem)] leading-[1.1] font-semibold tracking-[-0.035em]">
          Questions owners ask
        </h2>
        <p className="text-[15px]/relaxed text-foreground/70">
          Something else?{" "}
          <a href={contactHref} className={cn("underline-offset-4 hover:underline", brandText)}>
            Email us
          </a>
          .
        </p>
      </Reveal>
      {/* hiddenUntilFound keeps closed answers in the page, so search engines and Ctrl+F find them. */}
      <Reveal delay={0.1} className="min-w-0 flex-[2_1_480px]">
        <Accordion hiddenUntilFound defaultValue={faq.slice(0, 1).map((item) => item.question)} className="border-t">
          {faq.map((item) => (
            <AccordionItem key={item.question} value={item.question} className="border-b">
              <AccordionTrigger className="items-center gap-4 rounded-none py-5 text-base hover:no-underline [&_svg]:hidden!">
                {item.question}
                <span aria-hidden className={cn(sign, "group-aria-expanded/accordion-trigger:hidden")}>
                  +
                </span>
                <span aria-hidden className={cn(sign, "hidden group-aria-expanded/accordion-trigger:inline")}>
                  −
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-160 pb-5 text-[15px]/[1.65] text-pretty text-foreground/70">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  );
}
