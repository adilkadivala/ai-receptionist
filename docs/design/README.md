# Approved design: "Signal"

Approved by Adil on 2026-11-01. The live canvas is private: https://claude.ai/artifact/8XSRSdn4iZaZ7rW2NbtD7E. These files are copies of its three boards. Each is one HTML page; the markup and the inline styles are the reference, and the `<script>` at the end of each holds its sample data (call scripts, table rows, chart).

| File | What it shows |
|---|---|
| `theme.dc.html` | Colours, type, components, the call-outcome colours, the motif |
| `landing.dc.html` | The whole landing page, including the live call demo in five languages |
| `dashboard.dc.html` | The dashboard overview: shadcn's dashboard-01 layout in this theme |

The tokens are already in `packages/ui/src/styles/globals.css`. Use the Tailwind classes, never the hex values in these files:

| Design | Tailwind |
|---|---|
| Electric blue `#3340F0` | `bg-primary`, `text-primary`, `ring-ring` |
| Blue tint `#EEF0FE` with `#2A35C9` text (transferred) | `bg-brand-soft text-brand-soft-foreground` |
| Booked: green | `bg-success-soft text-success-foreground`, dot `bg-success` |
| Message taken: amber | `bg-warning-soft text-warning-foreground`, dot `bg-warning` |
| Spam blocked: grey | `bg-muted text-muted-foreground` |
| Page `#FAFAFA`, cards white | `bg-background`, `bg-card` |
| Hero grey `#F1F2F6` | `bg-hero` |
| Dashed guide lines `#D9DBE3` | `border-frame` |
| Text `#09090B`, muted `#63636B`, hairline `#E4E4E7` | `text-foreground`, `text-muted-foreground`, `border-border` |
| Geist, Geist Mono | `font-sans` (default), `font-mono` |

Rules the design follows:
- Headlines are semibold with tight tracking (about −0.035em to −0.05em). Small labels are Geist Mono, 12 px, uppercase, wide tracking.
- Thin borders do the work; shadows are barely there.
- Radius: 10 px for controls, 14–16 px for cards, 20 px for product frames.
- Only one accent colour. Status colours appear only on call outcomes.
- Animations respect `prefers-reduced-motion`.
