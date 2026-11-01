import { languageCount } from "@receptionist/product";
import { ImageResponse } from "next/og";
import { hero } from "@/content/home";
import { lowestPlanPrice } from "@/lib/plans";
import { ogImage, siteName } from "@/lib/site";

// The card shown when the site is shared. A route handler rather than the opengraph-image convention so the
// static export writes out/og.png with an extension, and any static host serves it as image/png.
export const dynamic = "force-static";

// The theme's --primary, --foreground and --muted-foreground as hex: the image renderer doesn't read CSS variables.
const blue = "#2062ce";
const ink = "#0a0a0a";
const muted = "#737373";

// lucide's phone-call icon, the same mark as the Logo block.
const phonePaths = [
  "M13 2a9 9 0 0 1 9 9",
  "M13 6a5 5 0 0 1 5 5",
  "M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",
];

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "white",
        color: ink,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 36 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 72,
            height: 72,
            borderRadius: 16,
            background: blue,
          }}
        >
          <svg
            width="36"
            height="36"
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
      <div style={{ display: "flex", maxWidth: 760, fontSize: 76, letterSpacing: -2, lineHeight: 1.05 }}>
        {hero.title}
      </div>
      <div style={{ display: "flex", fontSize: 32, color: muted }}>
        Answers 24/7 in {languageCount} languages · Plans from {lowestPlanPrice} a month
      </div>
    </div>,
    { width: ogImage.width, height: ogImage.height },
  );
}
