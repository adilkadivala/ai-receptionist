# DESIGN.md: AI Receptionist landing page

## Brief
- **Subject:** an AI phone receptionist that answers a business's calls 24/7 in 42 languages. It books appointments, takes messages, puts urgent calls through to a person and emails a summary of every call. Customers range from a one-person plumber to a hospital.
- **Audience:** owners who miss calls while they work (trades, salons, shops), busy professionals, and operations leads at hotels, hospitals and multi-branch companies. They have heard robotic phone bots before. They doubt it will understand their callers' language, book correctly, be honest that it's an AI, and be safe with patients.
- **One job:** start the self-serve sign-up ("Get started"). Large organizations get one secondary path: "Talk to sales".

## Direction
A front-desk call log: ruled rows, timestamps in monospace, plain paper surfaces and one blue "line in use" lamp for the thing that matters.

## Type
| Role | Font | Weights | Why |
|---|---|---|---|
| Display | System sans (`--font-heading`) | 600 | Fixed by the project: the system stack covers all 42 launch scripts with no download. Voice comes from size and tight tracking, not the face. |
| Text | System sans (`--font-sans`) | 400, 500 | Same stack, so a page in Hindi or Arabic renders with no fallback jump. |
| Mono / data | System mono (`font-mono`: ui-monospace, SF Mono, Menlo, Consolas) | 400, 500 | Timestamps, step numbers, eyebrows, prices per minute: the "call log" voice. Also a system font. |

Scale (Tailwind, about 1.25): 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60 px.
- h1: 36 → 48 → 60 px, weight 600, `tracking-tight`, `text-balance`.
- h2: 30 → 36 px, weight 600, `tracking-tight`.
- h3: 16–18 px, weight 500.
- Body 16 px (lead 18 px). Line length 45–75ch (`max-w-prose` or `max-w-2xl`).

## Color tokens
The landing page uses only the shared tokens in `packages/ui/src/styles/globals.css`. It adds no colors of its own; tints come from opacity on a token (`bg-primary/10`, `bg-muted/40`).

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | white | near-black | page |
| `--card` | white | dark gray | the example call, plan cards |
| `--muted` (at 40%) | light gray | dark gray | alternating section bands, card footers |
| `--foreground` | near-black | near-white | body text |
| `--muted-foreground` | gray (4.7:1 on white) | light gray | secondary text |
| `--border` | light gray | 10% white | hairlines, ruled rows |
| `--primary` | brand blue `oklch(0.52 0.18 260)` | brand blue `oklch(0.55 0.18 260)` | the one action color: "Get started", the lamp, icons |
| `--primary-foreground` | near-white | near-white | text on blue |

Small blue text (eyebrows, speaker labels, step numbers) uses `brandText` from `components/section.tsx`: plain `--primary` in light mode, and `--primary` mixed 25% toward white in dark mode, where plain blue on near-black is only about 4:1.

Dark mode follows the operating system: a small script in `app/layout.tsx` adds the `.dark` class the shared tokens expect.

## Space, radius, depth
- Spacing: Tailwind's 4 px scale. Sections `py-20 sm:py-28`; container `max-w-6xl px-4 sm:px-6` (16 px gutter on phones).
- Radius: the shared `--radius` family. Cards `rounded-xl`, controls `rounded-lg`, the final call to action `rounded-2xl`.
- Depth: hairlines and rings first. One shadow level (`shadow-sm`) on the hero's example call; nothing else floats.

## Motion
- Enter: 500 ms `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out). Only the hero's example call uses it: its lines appear one after another, so the call reads as it happened.
- UI feedback: shadcn's own 150–200 ms transitions (accordion, sheet, hover).
- Scrolling to a section is smooth only when motion is allowed.
- Reduced motion: no movement. `app/landing.css` cuts every animation and transition to near zero.

## 5 UX rules for this product
1. The price of the cheapest plan and the AI notice are visible in the hero, without scrolling.
2. One label for the main action everywhere: "Get started". Contracts get "Talk to sales".
3. Every claim on the page is backed by the README or `docs/architecture.md`. No testimonials, logos or usage numbers until they're real.
4. Every example (calls, transcripts) is labeled "Example".
5. Plans, prices and languages come from `@receptionist/product`, never typed into the page.

## Never
- Cards inside cards, icon tiles above headings, three identical feature cards as the page's structure.
- Gradients on backgrounds, buttons or text.
- Web fonts (they would break non-Latin scripts) and emoji as icons.
- `left`/`right` classes: use `start`/`end` and `ms-`/`me-`; arrows get `rtl:rotate-180`.
- Filler copy ("Unlock the power of…").
