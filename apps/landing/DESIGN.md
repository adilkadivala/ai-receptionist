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
All animation is Motion (`motion/react`), in client components; everything else is static and prerendered.
- Loops (waveform, booking slot, transfer dots, typing summary, marquees, call ticker, robocall) run on a clock from `lib/loop.ts` that advances only while the element is on screen and motion is allowed, so they pause in place.
- The live call demo adds a line every 2.3 s, shows the outcome for two beats, then moves to the next language. Picking a language replays that one. It has a pause button.
- Entrances: 450 ms ease-out (`rise` in the design). Only transform and opacity, plus `clip-path` for the typing summary.
- Reduced motion: nothing moves. Loops show a still frame of their most telling moment, and the demo shows each call whole with its outcome. `MotionConfig reducedMotion="user"` and `usePrefersReducedMotion` (hydration-safe) cover it; `app/landing.css` stops CSS animations.

## Components
`components/`: `FrameColumn` and `FrameRule` (dashed frame, blue squares where lines cross), `PixelField` (the dithered field behind the header), `DitherBand` (blue band with stepped edge), `DashboardPreview`, `BentoTile`, `OutcomePill`, `LiveDot`, `Section`/`SectionHeading`/`Eyebrow`, the call-to-action links, `demo/` (`LiveCallDemo`, `Waveform`) and `tiles/` (one animated example per feature). Copy and sample data live in `content/`.

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
