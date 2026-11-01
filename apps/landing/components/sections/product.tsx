import { existsSync } from "node:fs";
import { join } from "node:path";
import { languageCount } from "@receptionist/product";
import { audioPath, demoCalls } from "@/content/demo-calls";
import { product } from "@/content/home";
import { greetings, tiles } from "@/content/tiles";
import { BentoTile } from "../bento-tile";
import { LiveCallDemo } from "../demo/live-call-demo";
import { CountUp } from "../motion/count-up";
import { RevealGroup, RevealItem } from "../motion/reveal";
import { Section, SectionHeading } from "../section";
import { BlockedCall } from "../tiles/blocked-call";
import { BookingStack } from "../tiles/booking-stack";
import { CallRouting } from "../tiles/call-routing";
import { CallTicker } from "../tiles/call-ticker";
import { Marquee } from "../tiles/marquee";
import { TypingSummary } from "../tiles/typing-summary";

// Checked when the page is built: the demo offers sound only once every line has a recording (scripts/demo-audio.ts).
const hasAudio = demoCalls.every((call) =>
  call.turns.every((_, line) => existsSync(join(process.cwd(), "public", audioPath(call, line)))),
);

/** The product grid: the live call demo, then one small animated example per feature. */
export function Product() {
  return (
    <Section id="product" className="flex flex-col gap-10">
      <SectionHeading
        align="center"
        eyebrow={product.eyebrow}
        title={product.title}
        description={product.description}
        titleClassName="max-w-[720px] text-[clamp(2rem,4vw,3rem)] leading-[1.06] tracking-[-0.04em]"
      />
      {/* Four columns from 980 px, as in the design. In rem so Tailwind orders it after sm. */}
      <RevealGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[61.25rem]:grid-cols-4" stagger={0.07}>
        <RevealItem className="sm:col-span-2 sm:row-span-2">
          <LiveCallDemo hasAudio={hasAudio} className="h-full" />
        </RevealItem>
        <RevealItem>
          <BentoTile {...tiles.booking} className="h-full">
            <BookingStack />
          </BentoTile>
        </RevealItem>
        <RevealItem>
          <BentoTile {...tiles.transfer} className="h-full">
            <CallRouting />
          </BentoTile>
        </RevealItem>
        <RevealItem className="sm:col-span-2">
          <BentoTile {...tiles.summary} layout="row" className="h-full">
            <TypingSummary />
          </BentoTile>
        </RevealItem>
        <RevealItem className="sm:col-span-2">
          <BentoTile
            {...tiles.languages}
            aside={
              <span className="text-[28px] font-semibold tracking-[-0.04em] text-primary">
                <CountUp value={languageCount} />
              </span>
            }
            className="h-full overflow-hidden"
          >
            <div
              aria-hidden
              className="flex flex-col gap-2 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
            >
              <Marquee items={greetings.forward} durationMs={30000} itemClassName="border bg-card" />
              <Marquee items={greetings.backward} durationMs={34000} reverse itemClassName="bg-muted" />
            </div>
          </BentoTile>
        </RevealItem>
        <RevealItem>
          <BentoTile {...tiles.concurrent} className="h-full">
            <CallTicker />
          </BentoTile>
        </RevealItem>
        <RevealItem>
          <BentoTile {...tiles.spam} className="h-full">
            <BlockedCall />
          </BentoTile>
        </RevealItem>
      </RevealGroup>
    </Section>
  );
}
