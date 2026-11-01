import { languageCount } from "@receptionist/product";
import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { hero } from "@/content/home";
import { lowestPlanPrice } from "@/lib/plans";
import { ctaClassName, GetStartedLink } from "../cta-links";
import { ExampleCall } from "../example-call";
import { Container, Eyebrow } from "../section";

export function Hero() {
  return (
    <section className="pt-12 pb-20 sm:pt-20 sm:pb-28">
      <Container className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Eyebrow>
            {hero.eyebrow} · {languageCount} languages
          </Eyebrow>
          <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-pretty text-muted-foreground">{hero.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <GetStartedLink className={ctaClassName} />
            <a href="#pricing" className={cn(buttonVariants({ variant: "outline" }), ctaClassName)}>
              See pricing
            </a>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Plans from {lowestPlanPrice} a month. Callers always hear that they're talking to an AI.
          </p>
        </div>
        <ExampleCall />
      </Container>
    </section>
  );
}
