import type { Metadata } from "next";
import { DraftLegalPage } from "@/components/legal-page";
import { privacySections } from "@/content/legal";

// A draft: kept out of search results and the sitemap until a lawyer has reviewed it.
export const metadata: Metadata = {
  title: "Privacy policy (draft)",
  alternates: { canonical: "/privacy" },
  robots: { index: false },
};

export default function PrivacyPage() {
  return <DraftLegalPage title="Privacy policy" sections={privacySections} />;
}
