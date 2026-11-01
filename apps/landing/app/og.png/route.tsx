import { ImageResponse } from "next/og";
import { hero } from "@/content/home";
import { lowestPlanPrice } from "@/lib/plans";
import { ogImage, siteName } from "@/lib/site";

// The card shown when the site is shared. A route handler rather than the opengraph-image convention so the
// static export writes out/og.png with an extension, and any static host serves it as image/png.
export const dynamic = "force-static";

// The Signal theme as hex (docs/design/README.md): the image renderer doesn't read CSS variables.
const blue = "#3340F0";
const ink = "#09090B";
const muted = "#63636B";
const heroGrey = "#F1F2F6";

// lucide's phone-call icon, the same mark as the Logo block.
const phonePaths = [
  "M13 2a9 9 0 0 1 9 9",
  "M13 6a5 5 0 0 1 5 5",
  "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
];

// The blue band from the page, its top edge stepping out of the grey in four rows of pixels (components/dither-band.tsx).
function DitherBand() {
  return (
    <svg width="1200" height="150" viewBox="0 0 1200 150" aria-hidden="true">
      <defs>
        <pattern id="p75" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="6" height="6" fill={heroGrey} />
          <rect x="3" width="3" height="3" fill={blue} />
        </pattern>
        <pattern id="p50" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect width="3" height="3" fill={heroGrey} />
          <rect x="3" y="3" width="3" height="3" fill={heroGrey} />
        </pattern>
        <pattern id="p25" width="6" height="6" patternUnits="userSpaceOnUse">
          <rect x="3" width="3" height="3" fill={heroGrey} />
        </pattern>
        <pattern id="dots" width="12" height="12" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1.4" fill={heroGrey} />
        </pattern>
      </defs>
      <rect width="1200" height="150" fill={blue} />
      <rect width="1200" height="16" fill="url(#p75)" />
      <rect y="16" width="1200" height="16" fill="url(#p50)" />
      <rect y="32" width="1200" height="16" fill="url(#p25)" />
      <rect y="48" width="1200" height="16" fill="url(#dots)" />
    </svg>
  );
}

export function GET() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: heroGrey }}>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px 48px",
          color: ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 32, fontWeight: 600 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 60,
              height: 60,
              borderRadius: 14,
              background: blue,
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {phonePaths.map((d) => (
                <path key={d} d={d} />
              ))}
            </svg>
          </div>
          {siteName}
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 68, letterSpacing: -3, lineHeight: 1.05 }}>
          <span>{hero.title}</span>
          <span style={{ color: muted }}>{hero.subtitle}</span>
        </div>
        <div style={{ display: "flex", fontSize: 26, color: muted }}>
          Plans from {lowestPlanPrice} a month · Callers always hear they're talking to an AI
        </div>
      </div>
      <DitherBand />
    </div>,
    { width: ogImage.width, height: ogImage.height },
  );
}
