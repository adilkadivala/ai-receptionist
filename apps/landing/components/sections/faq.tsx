import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@receptionist/ui/components/accordion";
import { faq } from "@/content/faq";
import { salesEmail } from "@/lib/site";
import { Section, SectionHeading } from "../section";

export function Faq() {
  return (
    <Section id="faq" muted>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <SectionHeading
          eyebrow="FAQ"
          title="Questions, answered"
          description={
            <>
              Something else on your mind? Email{" "}
              <a href={`mailto:${salesEmail}`} className="font-medium text-foreground underline underline-offset-4">
                {salesEmail}
              </a>
              .
            </>
          }
          className="lg:sticky lg:top-24 lg:self-start"
        />
        {/* hiddenUntilFound keeps closed answers in the page, so search engines and Ctrl+F find them. */}
        <Accordion hiddenUntilFound className="border-y">
          {faq.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="py-4 text-base">{item.question}</AccordionTrigger>
              <AccordionContent className="pb-5 text-base text-pretty text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}
