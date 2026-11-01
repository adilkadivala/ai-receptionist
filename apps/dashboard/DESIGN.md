# Dashboard design

**Brief.** The back office of an AI phone receptionist. A plumber checks it between jobs on a phone; a hotel's front-office manager keeps it open on a laptop. They want to know what happened on their calls, trust that the AI handled them, and change what it says. Its one job: show what happened on every call, and make acting on it one tap away.

**Direction.** A call ledger: dense, tabular, numbers that line up. The transcript and the call log are the hero, not decoration.

## Tokens

The theme lives in `packages/ui/src/styles/globals.css` and is shared with the landing page. Don't change its fonts or colours from here.

- **Type:** the system stack only (`--font-sans`). It covers every launch script (Arabic, Devanagari, CJK…) without a download. Numbers use `tabular-nums`; phone numbers use `font-mono` only where they're compared in a column.
- **Colour:** `--primary` (brand blue) for actions and the AI's turns in a transcript. Neutrals from the shared theme. The dashboard adds two status tokens in `src/styles.css`: `--success` (bookings, paid) and `--warning` (near the minute limit, a number nobody answers). Both pass 4.5:1 as text.
- **Space:** Tailwind's 4 px scale. Page gutter `p-4` on phones, `p-8` from `sm`. Cards stack with `gap-4`, sections with `gap-6`/`gap-8`.
- **Radius and depth:** the shared `--radius` family; cards are a ring, not a shadow. Popovers and sheets keep shadcn's single shadow.
- **Motion:** only shadcn's own enter/exit (ease-out in, ease-in out, 100–200 ms). No decorative animation.

## UX rules

1. Every number on a card says what it's counted against ("142 of 350 minutes", not "142").
2. A call is one tap from anywhere it's mentioned, and its detail has a working "Call back" link.
3. Filters live in the URL, so a filtered list can be shared and survives a reload.
4. Forms validate on save, then live as the user fixes each field; the first invalid field gets focus.
5. Nothing pretends to work: data that's still a stand-in says "Sample data", and actions without a backend say what's missing.
