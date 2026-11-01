import { allLanguages, languageCount } from "@receptionist/product";
import { languagesCopy } from "@/content/home";
import { Eyebrow, Section } from "../section";

export function LanguagesSection() {
  return (
    <Section id="languages" className="flex flex-wrap gap-12">
      <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-3.5">
        <Eyebrow>Languages</Eyebrow>
        <p className="text-[120px] leading-[0.9] font-semibold tracking-[-0.06em] text-primary">{languageCount}</p>
        <h2 className="text-[28px] leading-[1.15] font-semibold tracking-[-0.03em] text-balance">
          {languagesCopy.title}
        </h2>
        <p className="text-base/[1.65] text-pretty text-foreground/70">{languagesCopy.description}</p>
      </div>
      <ul className="flex min-w-0 flex-[1.6_1_460px] flex-wrap content-start gap-2">
        {allLanguages.map((name) => (
          <li
            key={name}
            className="inline-flex h-[34px] items-center rounded-full border bg-card px-3.5 text-sm text-foreground/90"
          >
            {name}
          </li>
        ))}
      </ul>
    </Section>
  );
}
