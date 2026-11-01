# Dashboard design

**Brief.** The back office of an AI phone receptionist. A plumber checks it between jobs on a phone; a hotel's front-office manager keeps it open on a laptop. They want to know what happened on their calls, trust that the AI handled them, and change what it says. Its one job: show what happened on every call, and make acting on it one tap away.

**Direction.** "Signal", approved on 2026-11-01 (`docs/design/`): neutral greys, one electric blue, hairline borders, tight headlines. The layout is shadcn's dashboard-01: an inset sidebar beside one white frame, cards with trend badges, an area chart and the call table. `docs/design/dashboard.dc.html` is the reference; `docs/design/README.md` maps its colours to Tailwind classes.

## Tokens

The theme lives in `packages/ui/src/styles/globals.css` and is shared with the landing page. Don't change its fonts or colours from here, and never paste the mockups' hex values.

- **Type:** Geist for text, Geist Mono for small uppercase labels, phone numbers, lengths and keyboard hints. Headlines are semibold with tight tracking (`tracking-tight`, about −0.035em on big numbers). Arabic, Devanagari and CJK fall back to system fonts. Numbers use `tabular-nums`.
- **Colour:** `primary` for actions, the active chart series and the AI's turns in a transcript. Status colours appear only on call outcomes (and the trend badges the mockup gives them): Booked `bg-success-soft text-success-foreground`, Transferred `bg-brand-soft text-brand-soft-foreground`, Message taken `bg-warning-soft text-warning-foreground`, Spam `bg-muted text-muted-foreground`. Dots use `bg-success`, `bg-primary`, `bg-warning`.
- **Space:** Tailwind's 4 px scale. The frame's gutter is `px-4` on phones and `px-6` from `lg`. Cards stack with `gap-4`, sections with `gap-6`.
- **Radius and depth:** 10 px controls (`rounded-lg`), 14 px cards (`rounded-xl`), 16 px for the inset frame (`rounded-2xl`). Borders do the work; shadows stay at `shadow-xs`.
- **Motion:** only shadcn's own enter and exit (ease-out in, ease-in out, 100–200 ms) and the chart's first draw. Everything respects `prefers-reduced-motion`.

## UX rules

1. Every number on a card says what it's counted against ("212 of 350 minutes", not "212").
2. A call is one tap from anywhere it's mentioned, and its detail has a working "Call back" link.
3. Filters live in the URL, so a filtered list can be shared and survives a reload.
4. Forms validate on save, then live as the user fixes each field; the first invalid field gets focus. Saves confirm with a toast.
5. Nothing pretends to work: data that's still a stand-in says "Sample data", and actions without a backend say what's missing.
