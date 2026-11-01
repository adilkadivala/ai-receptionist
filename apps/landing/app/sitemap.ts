import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// Written to out/sitemap.xml at build time.
export const dynamic = "force-static";

// /privacy and /terms join once they're no longer drafts (they're noindex until then).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: new URL("/", siteUrl).href, changeFrequency: "monthly", priority: 1 }];
}
