import type { Metadata } from "next";
import { Faq } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LanguagesSection } from "@/components/sections/languages";
import { Pricing } from "@/components/sections/pricing";
import { Trust } from "@/components/sections/trust";
import { WhoItsFor } from "@/components/sections/who-its-for";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Features />
      <WhoItsFor />
      <LanguagesSection />
      <Pricing />
      <Trust />
      <Faq />
      <FinalCta />
    </>
  );
}
