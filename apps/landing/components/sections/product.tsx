import { languageCount } from "@receptionist/product";
import { product } from "@/content/home";
import { greetings, tiles } from "@/content/tiles";
import { BentoTile } from "../bento-tile";
import { LiveCallDemo } from "../demo/live-call-demo";
import { Section, SectionHeading } from "../section";
import { BlockedCall } from "../tiles/blocked-call";
import { BookingSlots } from "../tiles/booking-slots";
import { CallTicker } from "../tiles/call-ticker";
import { Marquee } from "../tiles/marquee";
import { TransferPath } from "../tiles/transfer-path";
import { TypingSummary } from "../tiles/typing-summary";

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
      <div className="grid gap-3 sm:grid-cols-2 min-[61.25rem]:grid-cols-4">
        <LiveCallDemo className="sm:col-span-2 sm:row-span-2" />
        <BentoTile {...tiles.booking}>
          <BookingSlots />
        </BentoTile>
        <BentoTile {...tiles.transfer}>
          <TransferPath />
        </BentoTile>
        <BentoTile {...tiles.summary} layout="row" className="sm:col-span-2">
          <TypingSummary />
        </BentoTile>
        <BentoTile
          {...tiles.languages}
          aside={<span className="text-[28px] font-semibold tracking-[-0.04em] text-primary">{languageCount}</span>}
          className="overflow-hidden sm:col-span-2"
        >
          <div
            aria-hidden
            className="flex flex-col gap-2 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
          >
            <Marquee items={greetings.forward} durationMs={24000} itemClassName="border bg-card" />
            <Marquee items={greetings.backward} durationMs={28000} reverse itemClassName="bg-muted" />
          </div>
        </BentoTile>
        <BentoTile {...tiles.concurrent}>
          <CallTicker />
        </BentoTile>
        <BentoTile {...tiles.spam}>
          <BlockedCall />
        </BentoTile>
      </div>
    </Section>
  );
}
