import "@receptionist/ui/globals.css";
import "./landing.css";
import { languageCount } from "@receptionist/product";
import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { FrameColumn } from "@/components/frame-lines";
import { MotionProvider } from "@/components/motion-provider";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { hero } from "@/content/home";
import { ogImage, siteName, siteUrl } from "@/lib/site";

const title = `${siteName}: every call answered, in ${languageCount} languages`;
const description =
  "An AI receptionist that answers your phone 24/7, books appointments, takes messages and transfers urgent calls, for businesses of every size.";
const images = [{ ...ogImage, alt: `${siteName}: ${hero.title} ${hero.subtitle}` }];

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: `%s · ${siteName}` },
  description,
  applicationName: siteName,
  openGraph: {
    type: "website",
    siteName,
    title,
    description,
    locale: "en_US",
    images,
  },
  twitter: { card: "summary_large_image", title, description, images },
};

// Follow the OS light/dark setting. Runs before first paint so there's no flash of the wrong theme.
const themeScript = `(() => {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = () => document.documentElement.classList.toggle("dark", query.matches);
  apply();
  query.addEventListener("change", apply);
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The theme script changes the class before React hydrates.
    <html lang="en" className="motion-safe:scroll-smooth" suppressHydrationWarning>
      <body className="antialiased">
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
        <Script id="theme" strategy="beforeInteractive">
          {themeScript}
        </Script>
        <a
          href="#main"
          className="sr-only rounded-lg bg-background px-3 py-2 text-sm font-medium ring-2 ring-ring focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50"
        >
          Skip to content
        </a>
        <MotionProvider>
          <FrameColumn>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </FrameColumn>
        </MotionProvider>
      </body>
    </html>
  );
}
