import { existsSync } from "node:fs";
import { join } from "node:path";
import { languageCount } from "@receptionist/product";
import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";
import { audioPath, demoCalls } from "@/content/demo-calls";
import { product } from "@/content/home";
import { greetings, tiles } from "@/content/tiles";
import { LiveCallDemo } from "../demo/live-call-demo";
import { HatchBand, Pattern } from "../drafting";
import { CountUp } from "../motion/count-up";
import { RevealGroup, RevealItem } from "../motion/reveal";
import { gutter, SectionHeading } from "../section";
import { StageCell } from "../stage-cell";
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

// Stage heights per row of the four-column grid, so the headings in a row line up.
const rowOne = "min-h-[252px]";
const rowThree = "min-h-[188px]";

/**
 * The product grid, drawn as a drafting sheet: the live call demo standing on its own stage, then one small animated
 * example per feature, each above its heading. The cells sit still and their contents rise in, so the hairlines
 * between them never flash.
 */
export function Product() {
  return (
    <section id="product" className="pt-24">
      <div className={gutter}>
        <SectionHeading
          align="center"
          eyebrow={product.eyebrow}
          title={product.title}
          description={product.description}
          titleClassName="max-w-[720px] text-[clamp(2rem,4vw,3rem)] leading-[1.06] tracking-[-0.04em]"
        />
      </div>
      <HatchBand className="mt-14" />
      {/* Four columns from 980 px, as in the design. In rem so Tailwind orders it after sm. */}
      <RevealGroup
        className="grid grid-cols-1 gap-px border-b bg-border sm:grid-cols-2 min-[61.25rem]:grid-cols-4"
        stagger={0.07}
      >
        <Cell className="sm:col-span-2 sm:row-span-2">
          <div className="relative h-full bg-hero p-3 sm:p-6">
            <Pattern kind="dots" />
            <LiveCallDemo hasAudio={hasAudio} className="relative h-full" />
          </div>
        </Cell>
        <Cell>
          <StageCell {...tiles.booking} pattern="hex" stageClassName={rowOne}>
            <BookingStack />
          </StageCell>
        </Cell>
        <Cell>
          <StageCell {...tiles.transfer} pattern="grid" stageClassName={rowOne}>
            <CallRouting />
          </StageCell>
        </Cell>
        <Cell className="sm:col-span-2">
          <StageCell {...tiles.summary} pattern="chevron" stageClassName="flex-1">
            <div className="mx-auto max-w-[400px]">
              <TypingSummary />
            </div>
          </StageCell>
        </Cell>
        <Cell className="sm:col-span-2">
          <StageCell
            {...tiles.languages}
            pattern="grid"
            stageClassName={cn(rowThree, "px-0 sm:px-0")}
            aside={
              <span className="text-[28px] leading-none font-semibold tracking-[-0.04em] text-primary">
                <CountUp value={languageCount} />
              </span>
            }
          >
            <div
              aria-hidden
              className="flex flex-col gap-2.5 py-1 [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
            >
              <Marquee items={greetings.forward} durationMs={30000} itemClassName="bg-card shadow-(--raised)" />
              <Marquee
                items={greetings.backward}
                durationMs={34000}
                reverse
                itemClassName="bg-card/70 text-foreground/80 shadow-(--raised)"
              />
            </div>
          </StageCell>
        </Cell>
        <Cell>
          <StageCell {...tiles.concurrent} pattern="hex" stageClassName={rowThree}>
            <CallTicker />
          </StageCell>
        </Cell>
        <Cell>
          <StageCell {...tiles.spam} pattern="dots" stageClassName={rowThree}>
            <BlockedCall />
          </StageCell>
        </Cell>
      </RevealGroup>
    </section>
  );
}

/** A grid cell: it stays put on the hairline grid while its contents rise in. */
function Cell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("bg-background", className)}>
      <RevealItem className="h-full">{children}</RevealItem>
    </div>
  );
}
