# DESIGN.md: AI Receptionist landing page

The approved design is **"Signal"** (approved 2026-11-01). The reference is `docs/design/landing.dc.html`; `docs/design/README.md` maps its colours to Tailwind classes. This file records how the landing page applies it.

## Brief
- **Subject:** an AI phone receptionist that answers a business's calls 24/7 in 42 languages. It books appointments, takes messages, puts urgent calls through to a person and emails a summary of every call. Customers range from a one-person plumber to a hospital.
- **Audience:** owners who miss calls while they work (trades, salons, shops), busy professionals, and operations leads at hotels, hospitals and multi-branch companies. They have heard robotic phone bots before. They doubt it will understand their callers' language, book correctly, be honest that it's an AI, and be safe with patients.
- **One job:** start the self-serve sign-up ("Get started"). Large organizations get one secondary path: "Talk to us".

## Direction
Signal: neutral greys, one electric blue, hairline borders and tight headlines. The page sits in a framed column of dashed lines; the blue arrives as a solid band whose top edge dithers out of the hero grey in pixels, and the product itself (a dashboard, a live call) is the hero artifact.

## Type
| Role | Font | Weights | Notes |
|---|---|---|---|
| Display and text | Geist (`font-sans`) | 400, 500, 600 | Latin only. Arabic, Devanagari, CJK and the other launch scripts fall back to the visitor's system font, so nothing breaks. |
| Labels and data | Geist Mono (`font-mono`) | 400, 500 | Section labels (12 px, uppercase, +0.08em), timers, step numbers, phone numbers. |

- h1: `clamp(44px, 7vw, 80px)`, semibold, −0.05em, line height 1. The second line is muted.
- h2: `clamp(32px, 4vw, 44–48px)`, semibold, −0.035 to −0.04em.
- h3: 15–19 px, semibold.
- Body 15–18 px, line height 1.6, in `text-foreground/70`. Line length under 75ch.

## Colour
Only the shared tokens in `packages/ui/src/styles/globals.css`, never hex values (the share image in `app/og.png/route.tsx` is the one exception: the image renderer can't read CSS variables).

| Use | Class |
|---|---|
| Page / cards | `bg-background` / `bg-card` |
| Hero and final call to action | `bg-hero` |
| Dashed frame lines | `border-dashed border-frame` |
| The one accent | `bg-primary`, `text-primary` |
| Text, secondary text, quiet text | `text-foreground`, `text-foreground/70` (body) and `/80` (UI labels), `text-muted-foreground` |
| Call outcomes only | booked `success`, transferred `brand-soft`, message taken `warning`, spam `muted` (`components/outcome-pill.tsx`) |

Small blue text (step numbers, the FAQ's email link) uses `brandText` from `components/section.tsx`, which lifts the blue toward white in dark mode, where plain `--primary` on near-black is under 4.5:1.

Dark mode follows the operating system (a small script in `app/layout.tsx` adds the `.dark` class). The approved look is light; dark uses the shared dark tokens.

## Space, radius, depth
- Column 1248 px (`max-w-312`) between dashed lines. Gutter 16 px on phones, 24 px from `sm`. Sections `py-24`.
- Radius: 10 px controls, 12 px buttons in the hero, 16 px cards and plan cards, 20 px product tiles and frames, 24 px the final call to action.
- Depth: hairlines do the work. `shadow-xs` on outline buttons and the demo tile; one soft blue glow on the featured plan.

## Motion
Animation is Motion (`motion/react`) in client components, plus one CSS entrance for the hero; everything else is static and prerendered.
- **Easing** (`lib/motion.ts`): `ease.enter` `cubic-bezier(0.22, 1, 0.36, 1)` for anything arriving, `ease.move` `cubic-bezier(0.65, 0, 0.35, 1)` for things moving on screen. Entrances 450–700 ms, state changes 250–600 ms.
- **Hero:** each piece rises 14 px into place in turn (`.animate-rise` in `app/landing.css`, staggered by `--rise-delay`). It's CSS, so it plays before JavaScript loads. The dashboard preview then tilts flat as it scrolls up (`components/motion/tilt-in.tsx`), and its numbers count up.
- **Scroll reveals** (`components/motion/reveal.tsx`): section headings, the product tiles, steps, languages, plans, trust items, FAQ and the final call to action rise 18 px and fade in once, groups one after another. In grids drawn with `gap-px` the cell's contents move, never the cell, so the lines between cells don't flash. Without JavaScript a `<noscript>` style in `app/layout.tsx` shows them.
- **Live call demo:** each line appears from its speaker's side; with sound on, the next line waits for the recording to end and the waveform follows the real voice (`lib/call-audio.ts`, Web Audio). The caller's voice goes through a 300–3,400 Hz telephone filter. Without sound, a line stays as long as it takes to read. After the outcome it moves to the next language; picking one replays it. Until the recordings exist (`scripts/demo-audio.ts`), the browser's own voices read the lines instead (`lib/browser-voice.ts`): two voices where the browser has them, otherwise the caller pitched lower, and silence for a language it has no voice for; the caption says so. "Listen" only shows when there's something to play. Pause button. "Hear a live call" in the hero jumps to the demo and turns sound on.
- **Tiles** cycle through states with `useTicker` (`lib/motion.ts`), only while on screen: the booking stack grows upward a booking at a time, calls route to you (urgent) or stay with the receptionist, summary emails type themselves out, new calls push the feed down, and robocalls are struck out after two real calls get through. The marquees run on the clock in `lib/loop.ts`.
- **Hover:** the main buttons' arrows move 2 px forward; plan cards lift 4 px.
- **Reduced motion** keeps things changing but stops them moving: `MotionConfig reducedMotion="user"` drops transforms and keeps fades, so the demo and the tiles still play as dissolves, the hero fades in, and the marquees, waveform and tilt stand still. `app/landing.css` cuts CSS animations to a fade. `usePrefersReducedMotion` is hydration-safe.

## Components
`components/`: `FrameColumn` and `FrameRule` (dashed frame, blue squares where lines cross), `PixelField` (the dithered field behind the header), `DitherBand` (blue band with stepped edge), `DashboardPreview`, `BentoTile`, `OutcomePill`, `LiveDot`, `Section`/`SectionHeading`/`Eyebrow`, the call-to-action links, `motion/` (`Reveal`, `RevealGroup`/`RevealItem`, `CountUp`, `TiltIn`), `demo/` (`LiveCallDemo`, `Waveform`) and `tiles/` (one animated example per feature: `BookingStack`, `CallRouting`, `TypingSummary`, `Marquee`, `CallTicker`, `BlockedCall`). Copy and sample data live in `content/`; the demo's recordings in `public/demo-audio/`.

## 5 UX rules for this product
1. The price of the cheapest plan and the AI notice are visible in the hero, without scrolling.
2. One label for the main action everywhere: "Get started". Contracts get "Talk to us".
3. Every claim on the page is backed by the README or `docs/architecture.md`. No testimonials, logos or usage numbers until they're real.
4. Every example is labeled: the demo says "Example call", the dashboard preview is captioned as sample data.
5. Plans, prices and languages come from `@receptionist/product`, never typed into the page.

## Never
- A second accent colour, or status colours outside call outcomes.
- Gradients as decoration (the pixel patterns and fades are the only ones, and they're the motif).
- Emoji as icons; filler copy ("Unlock the power of…").
- `left`/`right` classes for layout: use `start`/`end` and `ms-`/`me-`; arrows get `rtl:rotate-180`. (The transfer tile draws its legs left to right and mirrors them as a whole for RTL.)
- Animation that ignores reduced motion, or keeps running off screen.
- Sound that starts without a click.
