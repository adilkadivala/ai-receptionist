import { languageCount, languages } from "@receptionist/product";
import { Badge } from "@receptionist/ui/components/badge";
import { mixedLanguageCall } from "@/content/transcripts";
import { Section, SectionHeading } from "../section";
import { Transcript } from "../transcript";

export function LanguagesSection() {
  return (
    <Section id="languages">
      <SectionHeading
        eyebrow="Languages"
        title={`${languageCount} languages from day one`}
        description="It hears which language your caller speaks and answers in it, even when they mix two, like Hindi and English or Arabic and English. Every plan includes all of them."
      />
      <div className="mt-12 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <figure className="self-start rounded-xl bg-card p-5 ring-1 ring-foreground/10">
          <figcaption className="mb-4 flex items-center justify-between gap-3">
            <span className="font-mono text-xs font-medium tracking-wider text-muted-foreground uppercase">
              {mixedLanguageCall.label}
            </span>
            <Badge variant="outline">Example</Badge>
          </figcaption>
          <Transcript turns={mixedLanguageCall.turns} />
        </figure>
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2">
          {Object.entries(languages).map(([region, names]) => (
            <div key={region}>
              <h3 className="flex items-baseline justify-between gap-3 border-b pb-2 text-sm font-medium">
                {region}
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  {names.length}
                  <span className="sr-only"> languages</span>
                </span>
              </h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {names.map((name) => (
                  <li key={name}>
                    <Badge variant="secondary" className="h-7 px-3 text-sm font-normal">
                      {name}
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
