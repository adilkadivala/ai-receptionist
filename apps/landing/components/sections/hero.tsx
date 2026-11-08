import { ArrowRight } from "lucide-react";
import type { CSSProperties } from "react";
import { hero } from "@/content/home";
import { lowestPlanPrice } from "@/lib/plans";
import { Blueprint } from "../blueprint";
import { BookDemoLink, HearCallLink } from "../cta-links";
import { DashboardPreview } from "../dashboard-preview";
import { DeskProps } from "../desk-props";
import { TiltIn } from "../motion/tilt-in";
import { gutter } from "../section";
import { SiteHeader } from "../site-header";

// The hero's pieces rise in one after another with .animate-rise (landing.css). It's CSS, so it plays before
// JavaScript loads; this sets each piece's delay.
const after = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * A blueprint panel inset in the framed column: the header, the headline and the dashboard lying on a drafting mat,
 * with a few desk objects around it. The "Built for" sheet below curves up over its bottom edge.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="px-2 pt-2 sm:px-3 sm:pt-3">
      <div className="relative overflow-hidden rounded-[20px] bg-(--ink) text-primary-foreground sm:rounded-[28px]">
        <Blueprint top={72} />
        <DeskProps variant="hero" />
        <SiteHeader tone="ink" className="border-b border-(--ink-line)" />

        <div className={`relative pt-16 text-center sm:pt-20 ${gutter}`}>
          <a
            href="#languages"
            className="animate-rise inline-flex h-8 items-center gap-2.5 rounded-full border border-primary-foreground/15 bg-primary-foreground/8 ps-1 pe-3 text-[13px] text-primary-foreground/85 backdrop-blur-sm transition-colors hover:bg-primary-foreground/14 hover:text-primary-foreground"
          >
            <span className="inline-flex h-6 items-center rounded-full bg-primary-foreground px-2 font-mono text-[11px] tracking-[0.06em] text-(color:--ink) uppercase">
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
            <span className="animate-rise block" style={after(90)}>
              {hero.title}
            </span>
            <span className="animate-rise block text-primary-foreground/55" style={after(180)}>
              {hero.subtitle}
            </span>
          </h1>
          <p
            className="animate-rise mx-auto mt-6 max-w-[620px] text-lg/relaxed text-pretty text-primary-foreground/72"
            style={after(280)}
          >
            {hero.description}
          </p>
          <div className="animate-rise mt-8 flex flex-wrap justify-center gap-3" style={after(370)}>
            <BookDemoLink variant="inverse" arrow />
            <HearCallLink variant="glass" />
          </div>
          <p className="animate-rise mt-[18px] text-[13px] text-primary-foreground/55" style={after(450)}>
            Plans from {lowestPlanPrice} a month. Callers always hear they're talking to an AI.
          </p>
        </div>

        {/* The bottom padding is the part the sheet below covers, so the dashboard runs into it. */}
        <div className={`relative mt-14 pb-12 text-center text-foreground sm:mt-16 sm:pb-[72px] ${gutter}`}>
          <div className="animate-rise" style={after(540)}>
            <TiltIn>
              <DashboardPreview />
            </TiltIn>
          </div>
        </div>
      </div>
    </section>
  );
}
