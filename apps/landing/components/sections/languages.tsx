import { allLanguages, languageCount } from "@receptionist/product";
import { languagesCopy } from "@/content/home";
import { Pattern } from "../drafting";
import { CountUp } from "../motion/count-up";
import { Reveal, RevealGroup, RevealItem } from "../motion/reveal";
import { Eyebrow, Section } from "../section";

export function LanguagesSection() {
  return (
    <Section id="languages" className="flex flex-wrap gap-12">
      <Reveal className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5">
        <Eyebrow>Languages</Eyebrow>
        <p className="text-[120px] leading-[0.9] font-semibold tracking-[-0.06em] text-primary">
          <CountUp value={languageCount} durationS={1.6} />
        </p>
        <h2 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.03em] text-balance">
          {languagesCopy.title}
        </h2>
        <p className="text-base/[1.65] text-pretty text-foreground/70">{languagesCopy.description}</p>
      </Reveal>
      {/* The languages as chips in a tray pressed into the sheet. */}
      <div className="relative min-w-0 flex-[1.6_1_460px] self-start overflow-hidden rounded-[24px] bg-hero p-4 shadow-(--tray) sm:p-6">
        <Pattern kind="dots" />
        <RevealGroup as="ul" stagger={0.018} className="relative flex flex-wrap gap-2">
          {allLanguages.map((name) => (
            <RevealItem
              as="li"
              key={name}
              className="inline-flex h-[34px] items-center rounded-full bg-card px-3.5 text-sm text-foreground/90 shadow-(--raised)"
            >
              {name}
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </Section>
  );
}
