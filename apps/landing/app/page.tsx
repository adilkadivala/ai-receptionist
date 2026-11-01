import { Badge } from "@receptionist/ui/components/badge";
import { buttonVariants } from "@receptionist/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@receptionist/ui/components/card";
import { Separator } from "@receptionist/ui/components/separator";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowRight, BriefcaseBusiness, Building, Check, Hospital, Hotel, type LucideIcon, Wrench } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { included, languageCount, languages, overagePerMinute, plans, segments } from "./content";

// Inlined at build time. In production this is the dashboard's own domain, e.g. https://app.example.com.
const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:5173";
const signupUrl = `${dashboardUrl}/signup`;

const segmentIcons: Record<(typeof segments)[number]["name"], LucideIcon> = {
  "Small businesses": Wrench,
  "Business people": BriefcaseBusiness,
  "Busy hotels": Hotel,
  "Hospitals and clinics": Hospital,
  "Mid-size and large companies": Building,
};

export default function Home() {
  return (
    <>
      <SiteHeader signupUrl={signupUrl} />

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
          <Badge variant="secondary">{languageCount} languages · answers 24/7</Badge>
          <h1 className="mx-auto mt-6 max-w-3xl font-heading text-4xl font-semibold tracking-tight text-balance sm:text-6xl">
            Every call answered. In {languageCount} languages.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-pretty text-muted-foreground">
            An AI receptionist that answers your phone 24/7, books appointments, takes messages and transfers urgent
            calls to a person, for a one-person plumbing business or a large hospital.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={signupUrl} className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Get started
              <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
            </a>
            <a
              href="#pricing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5 text-base")}
            >
              See pricing
            </a>
          </div>
        </section>

        <section id="who" className="scroll-mt-16 border-y bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Built for every size of business</h2>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => {
                const Icon = segmentIcons[segment.name];
                return (
                  <Card key={segment.name}>
                    <CardHeader>
                      <span className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </span>
                      <CardTitle>{segment.name}</CardTitle>
                      <CardDescription>{segment.examples}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p>{segment.does}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section id="languages" className="scroll-mt-16 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">
              {languageCount} languages from day one
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              The AI hears which language your caller speaks and answers in it, even when they mix two, like Hindi and
              English or Arabic and English.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {Object.entries(languages).map(([region, names]) => (
                <div key={region}>
                  <h3 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{region}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {names.map((name) => (
                      <li key={name}>
                        <Badge variant="secondary" className="h-7 px-3 text-sm">
                          {name}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-16 border-y bg-muted/40 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-3xl font-semibold tracking-tight">Simple monthly plans</h2>
            <p className="mt-4 text-muted-foreground">
              Extra minutes are ${overagePerMinute.toFixed(2)} each. Every plan includes:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {included.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {plans.map((plan) => {
                const featured = "featured" in plan;
                return (
                  <Card key={plan.name} className={cn(featured && "ring-2 ring-primary")}>
                    <CardHeader>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.for}</CardDescription>
                      {featured && (
                        <CardAction>
                          <Badge>Most popular</Badge>
                        </CardAction>
                      )}
                    </CardHeader>
                    <CardContent className="flex-1">
                      <p>
                        <span className="font-heading text-4xl font-semibold">${plan.price}</span>
                        <span className="text-muted-foreground">/month</span>
                      </p>
                      <p className="mt-2">{plan.minutes} call minutes included</p>
                    </CardContent>
                    <CardFooter>
                      <a
                        href={`${signupUrl}?plan=${plan.name.toLowerCase()}`}
                        className={cn(buttonVariants({ variant: featured ? "default" : "outline" }), "w-full")}
                      >
                        Choose {plan.name}
                      </a>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Hotels, hospitals and large companies</CardTitle>
                <CardDescription>
                  Priced per minute and billed by invoice, with department routing, your choice of data region and
                  integrations with your booking or scheduling system.
                </CardDescription>
                <CardAction>
                  <a href="mailto:sales@example.com" className={buttonVariants({ variant: "outline" })}>
                    Talk to us
                    <ArrowRight data-icon="inline-end" className="rtl:rotate-180" />
                  </a>
                </CardAction>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground sm:px-6">
        <Separator className="mb-6" />
        Callers are always told they are speaking with an AI. © {new Date().getFullYear()} AI Receptionist
      </footer>
    </>
  );
}
