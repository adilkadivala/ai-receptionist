import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { FilePen } from "lucide-react";
import type { LegalSection } from "@/content/legal";
import { contactHref, salesEmail } from "@/lib/site";
import { PixelField } from "./pixel-field";
import { gutter } from "./section";

/** A legal page that is still a draft: a clear notice at the top, then the sections. */
export function DraftLegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <>
      {/* pt-18 leaves room for the header, which lies over this band. */}
      <div className={cn("relative border-b border-dashed border-frame bg-hero pt-18", gutter)}>
        <PixelField />
        <div className="relative mx-auto max-w-3xl pt-16 pb-12">
          <Badge variant="outline" className="bg-card">
            Draft
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">{title}</h1>
        </div>
      </div>
      <div className={cn("mx-auto max-w-3xl py-16", gutter)}>
        <Alert role="note">
          <FilePen />
          <AlertTitle>This page is a draft placeholder</AlertTitle>
          <AlertDescription>
            It is not in force yet. Before launch it will be replaced by text reviewed by a lawyer. Questions until
            then: <a href={contactHref}>{salesEmail}</a>.
          </AlertDescription>
        </Alert>
        <div className="mt-12 space-y-10">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-xl font-semibold tracking-[-0.02em]">{section.heading}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className="mt-3 text-pretty">
                  {paragraph}
                </p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
