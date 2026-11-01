import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Badge } from "@receptionist/ui/components/badge";
import { FilePen } from "lucide-react";
import type { LegalSection } from "@/content/legal";
import { salesEmail } from "@/lib/site";
import { Container } from "./section";

/** A legal page that is still a draft: a clear notice at the top, then the sections. */
export function DraftLegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <Container className="max-w-3xl py-16 sm:py-24">
      <Badge variant="outline">Draft</Badge>
      <h1 className="mt-4 font-heading text-4xl font-semibold tracking-tight">{title}</h1>
      <Alert role="note" className="mt-8">
        <FilePen />
        <AlertTitle>This page is a draft placeholder</AlertTitle>
        <AlertDescription>
          It is not in force yet. Before launch it will be replaced by text reviewed by a lawyer. Questions until then:{" "}
          <a href={`mailto:${salesEmail}`}>{salesEmail}</a>.
        </AlertDescription>
      </Alert>
      <div className="mt-12 space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-pretty">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </div>
    </Container>
  );
}
