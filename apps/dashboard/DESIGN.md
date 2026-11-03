# Dashboard design

**Brief.** The back office of an AI phone receptionist. A plumber checks it between jobs on a phone; a hotel's front-office manager keeps it open on a laptop. They want to know what happened on their calls, trust that the AI handled them, and change what it says. Its one job: show what happened on every call, and make acting on it one tap away.

**Direction.** "Signal" on the drafting table, the same as the landing page (`apps/landing/DESIGN.md`, redesigned 2026-11-01): neutral greys, one electric blue, hairline borders and tight headlines, drawn like a technical sheet. The layout is still shadcn's dashboard-01 (an inset sidebar beside one frame, stat cells, an area chart, the call table), translated into the landing's language:

- **The sidebar is blueprint ink** (`--ink`, Signal blue taken halfway to black) with a faint 24 px grid that fades out downward and a short numbered ruler under the business, as on the landing's hero. Pages are white at 75%; the current page is full white on clear glass. "Make a test call" is the white button the hero uses for "Get started"; the minutes card is clear glass with a white bar.
- **The page is a light sheet lying on that ink**, 20 px corners (on phones it fills the screen under an 8 px strip of ink). A dashed guide line runs under the header with a blue square at each end, like the lines that cross the landing's frame.
- **Numbers sit in flush cells split by hairlines** (a grid drawn with `gap-px` on `bg-border`), edge to edge across the sheet, after a hatched band, the way the landing's product grid follows its heading.
- **Objects stand on the sheet** on the landing's two shadows instead of borders, and **examples stand on patterned grey stages**: the call chart, "What callers hear" and every empty state.
- **Section titles are the landing's labels**: blue Geist Mono between drafting brackets (⊣| CALLS |⊢), with a line of description under them.
- **Sign-up and login are the landing's hero**: the full blueprint mat (grid, rulers, construction lines, the dithered light) with one white card lying on it.

`docs/design/dashboard.dc.html` is the original Signal mockup; `docs/design/README.md` maps its colours to Tailwind classes.

## Tokens

Everything comes from `packages/ui/src/styles/globals.css`, shared with the landing page. Don't change its fonts or colours from here, and never paste hex values: new tokens are mixed from the existing ones.

- **Type:** Geist for text, Geist Mono for section labels, phone numbers, lengths, call times in transcripts and keyboard hints. The Overview's headline is `clamp(26px, 3vw, 32px)`, semibold, −0.035em; big numbers 32 px, −0.035em, `tabular-nums`; body 14 px, page leads 15 px in `text-foreground/70`. Arabic, Devanagari and CJK fall back to system fonts.
- **Colour:**

| Use | Class |
|---|---|
| Sidebar, the strip behind the sheet, sign-in pages | `bg-(--ink)`; lines `--ink-line`; text `text-primary-foreground` at 100/75/60%. `src/styles.css` mixes shadcn's `--sidebar*` tokens from these. |
| The sheet / objects on it | `bg-background` / `bg-card` |
| Stages (chart, greeting preview, empty states), trays, the current tab | `bg-hero` |
| Dashed guide lines, stage patterns, hatched bands | `border-dashed border-frame`, `bg-frame` |
| The one accent | `bg-primary`, `text-primary`; small blue text uses `brandText` (lifted toward white in dark mode) |
| Text, secondary text, quiet text | `text-foreground`, `text-foreground/70` (leads, descriptions) and `/80`, `text-muted-foreground` |
| Call outcomes only (plus the trend chips) | Booked `bg-success-soft text-success-foreground`, Transferred `bg-brand-soft text-brand-soft-foreground`, Message taken `bg-warning-soft text-warning-foreground`, Spam `bg-muted text-muted-foreground`: the landing's pills, no border, no dot (`outcome-badge.tsx`) |

- **Space:** Tailwind's 4 px scale. The sheet's gutter is `px-4` on phones and `px-6` from `lg`; stat cells use the same padding, so their text lines up with the page. Objects stack with `gap-6`, Billing's sections with `gap-12`.
- **Radius:** 10 px controls, 12 px the tab bar, 14 px stages, trays and list items, 16 px objects and plan cards, 20 px the sheet and the sign-in card.
- **Depth** (`src/components/surfaces.ts`): hairlines draw the structure; objects carry one of two shadows, each with its own hairline, so they need no border and shared Cards drop their ring.
  - `floating` (`shadow-(--float)`): the page's main objects: the call table, the chart, the numbers table, plan cards, the minutes card.
  - `raised` (`shadow-(--raised)`): settings groups, the add-ons list, invoices, server status, the call facts.
  - `resting`: chips, pills, badges and outline buttons. The shared `Button` is shadcn's code and stays bordered, so outline buttons pass `className={resting}`. The language filter's dashed "add" button and its split pair keep their borders.
  - `glass`: panels on the ink.
- **Patterns** (`Pattern` from `@receptionist/ui/blocks/drafting`): dots under the chart, chevrons under the greeting, hex under empty states. Only on stages.

## Motion

The landing page's motion is for a page read once; this is a screen people keep open all day, so it doesn't move for decoration.

- shadcn's own enter and exit (ease-out in, ease-in out, 100–200 ms), the chart's first draw, and the cards dimming while a new range loads.
- Sign-up and login rise into place once (`.animate-rise`, the hero's entrance, 90 ms apart).
- No pulsing dots, count-ups, tilts or loops.
- Reduced motion: the shared rule in `globals.css` cuts CSS animations to a frame and transitions to none, entrances fade instead of rising, and the chart draws without animating (`useReducedMotion`).

## Components

`src/components/`: `AppSidebar` with `SidebarMat` and `SidebarRuler` (the blueprint it's drawn on), `SiteHeader` with `FrameRule` (the dashed guide line), `PageHeader` (optional bracketed label, headline, lead, actions), `SectionTitle` (a section's bracketed label, description and controls), `StatCard` (one hairline cell), `EmptyState` (a patterned stage with the icon as a white object), `SettingsCard`, `DataTable`, `Pager`, `SaveBar`, `UsageMeter` (`onInk` draws the bar in white), `surfaces.ts`. From `@receptionist/ui/blocks/`: `Blueprint`, `blueprintGrid`, `rulerTicks`, `Pattern`, `HatchBand`, `Eyebrow`, `brandText` and `PlanCard`, all shared with the landing page.

## The admin area

`/admin` is the founders' view across every customer (docs/development.md). It's drawn with the same system so it needs no second one, with three differences so it's never mistaken for a customer's dashboard: its sidebar is headed "Admin · every customer" and ends with a glass note saying it works on this computer only; the header carries an "Admin, read only" chip where the customer's carries "Sample data"; and it shows only real data from the api, so it has no sample-data chip at all. The customer list and a customer's calls are `floating` tables, a customer's numbers and receptionists are `raised` settings cards, the totals are the Overview's hairline cells, and a call opens in the same sheet as a customer's call. Calls by outcome is a list of outcome pills with bars in the one accent.

## UX rules

1. Every number on a card says what it's counted against ("212 of 350 minutes", not "212").
2. A call is one tap from anywhere it's mentioned, and its detail has a working "Call back" link.
3. Filters live in the URL, so a filtered list can be shared and survives a reload.
4. Forms validate on save, then live as the user fixes each field; the first invalid field gets focus. Saves confirm with a toast.
5. Nothing pretends to work: data that's still a stand-in says "Sample data", and actions without a backend say what's missing.

## Never

- A second accent colour, or status colours outside call outcomes and trend chips.
- Gradients as decoration. The chart's fills, the stage patterns' fade and the blueprint's grid fade are the only ones.
- Blue text or blue bars on the ink: they don't read. Use white.
- Borders on objects that already carry a shadow.
- Animation that runs on its own, or ignores reduced motion.
- `left`/`right` classes for layout: use `start`/`end` and `ms-`/`me-`; arrows get `rtl:rotate-180`.
- Emoji as icons; filler copy.
