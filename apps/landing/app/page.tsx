import type { Metadata } from "next";
import { BuiltFor } from "@/components/sections/built-for";
import { Faq } from "@/components/sections/faq";
import { FinalCta } from "@/components/sections/final-cta";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { LanguagesSection } from "@/components/sections/languages";
import { Pricing } from "@/components/sections/pricing";
import { Product } from "@/components/sections/product";
import { Trust } from "@/components/sections/trust";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Home() {
  return (
    <>
      <Hero />
      <BuiltFor />
      <Product />
      <HowItWorks />
      <LanguagesSection />
      <Pricing />
      <Trust />
      <Faq />
      <FinalCta />
    </>
  );
}
