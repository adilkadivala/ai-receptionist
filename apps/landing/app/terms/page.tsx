import type { Metadata } from "next";
import { DraftLegalPage } from "@/components/legal-page";
import { termsSections } from "@/content/legal";

// A draft: kept out of search results and the sitemap until a lawyer has reviewed it.
export const metadata: Metadata = {
  title: "Terms of service (draft)",
  alternates: { canonical: "/terms" },
  robots: { index: false },
};

export default function TermsPage() {
  return <DraftLegalPage title="Terms of service" sections={termsSections} />;
}
