import { ArrowRight } from "lucide-react";
import { hero } from "@/content/home";
import { lowestPlanPrice } from "@/lib/plans";
import { GetStartedLink, HearCallLink } from "../cta-links";
import { DashboardPreview } from "../dashboard-preview";
import { DitherBand } from "../dither-band";
import { FrameRule } from "../frame-lines";
import { PixelField } from "../pixel-field";
import { gutter } from "../section";

export function Hero() {
  return (
    // pt-18 leaves room for the header, which lies over this band.
    <section aria-labelledby="hero-title" className="relative bg-hero pt-18">
      <PixelField />
      <div className={`relative pt-18 text-center ${gutter}`}>
        <a
          href="#languages"
          className="inline-flex h-8 items-center gap-2.5 rounded-full border bg-card ps-1 pe-3 text-[13px] text-foreground/80 transition-colors hover:text-foreground"
        >
          <span className="inline-flex h-6 items-center rounded-full bg-foreground px-2 font-mono text-[11px] tracking-[0.06em] text-background uppercase">
            {hero.badge}
          </span>
          {hero.announcement}
          <ArrowRight aria-hidden className="size-3.5 rtl:rotate-180" />
        </a>
        <h1
          id="hero-title"
          className="mx-auto mt-7 max-w-[920px] text-[clamp(2.75rem,7vw,5rem)] leading-none font-semibold tracking-[-0.05em] text-balance"
        >
          {/* Two blocks, so each line balances on its own when it wraps. */}
          <span className="block">{hero.title}</span>
          <span className="block text-muted-foreground">{hero.subtitle}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[620px] text-lg/relaxed text-pretty text-foreground/70">{hero.description}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <GetStartedLink arrow />
          <HearCallLink />
        </div>
        <p className="mt-[18px] text-[13px] text-muted-foreground">
          Plans from {lowestPlanPrice} a month. Callers always hear they're talking to an AI.
        </p>
      </div>

      <DitherBand className={`mt-16 pt-[92px] text-center ${gutter}`}>
        <FrameRule />
        <DashboardPreview />
      </DitherBand>
    </section>
  );
}
