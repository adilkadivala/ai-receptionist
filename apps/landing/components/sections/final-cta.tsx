import { languageCount } from "@receptionist/product";
import { cn } from "@receptionist/ui/lib/utils";
import { lowestPlanPrice } from "@/lib/plans";
import { ctaClassName, GetStartedLink, TalkToSalesLink } from "../cta-links";
import { Container } from "../section";

export function FinalCta() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="rounded-2xl bg-primary px-6 py-12 text-primary-foreground sm:px-12 sm:py-16">
          <h2 className="max-w-2xl font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Let every call get answered
          </h2>
          <p className="mt-4 max-w-2xl text-lg text-pretty text-primary-foreground/80">
            Start on a monthly plan from {lowestPlanPrice}, with all {languageCount} languages included. Running a
            hotel, hospital or large company? We'll price a contract around your calls.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GetStartedLink variant="secondary" className={ctaClassName} />
            <TalkToSalesLink
              variant="ghost"
              className={cn(
                ctaClassName,
                "border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
              )}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
