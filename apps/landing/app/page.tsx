import { included, languageCount, languages, overagePerMinute, plans, segments } from "./content";

// Inlined at build time. In production this is the dashboard's own domain, e.g. https://app.example.com.
const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:5173";

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <span className="text-lg font-semibold">AI Receptionist</span>
        <nav className="flex items-center gap-6 text-sm text-slate-600">
          <a href="#who" className="hidden hover:text-slate-900 sm:inline">
            Who it's for
          </a>
          <a href="#languages" className="hidden hover:text-slate-900 sm:inline">
            Languages
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Pricing
          </a>
          <a
            href={`${dashboardUrl}/signup`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
          >
            Get started
          </a>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 text-center sm:px-6 sm:pt-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
            Every call answered. In {languageCount} languages.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
            An AI receptionist that answers your phone 24/7, books appointments, takes messages and transfers urgent
            calls to a person, for a one-person plumbing business or a large hospital.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={`${dashboardUrl}/signup`}
              className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
            >
              Get started
            </a>
            <a href="#pricing" className="rounded-lg border border-slate-300 px-6 py-3 font-medium hover:bg-slate-50">
              See pricing
            </a>
          </div>
        </section>

        <section id="who" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">Built for every size of business</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {segments.map((segment) => (
                <div key={segment.name} className="rounded-xl border border-slate-200 bg-white p-6">
                  <h3 className="font-semibold">{segment.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{segment.examples}</p>
                  <p className="mt-4 text-slate-700">{segment.does}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="languages" className="py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">{languageCount} languages from day one</h2>
            <p className="mt-4 max-w-2xl text-slate-600">
              The AI hears which language your caller speaks and answers in it, even when they mix two, like Hindi and
              English or Arabic and English.
            </p>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {Object.entries(languages).map(([region, names]) => (
                <div key={region}>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-500 uppercase">{region}</h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {names.map((name) => (
                      <li key={name} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-900">
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-3xl font-bold tracking-tight">Simple monthly plans</h2>
            <p className="mt-4 text-slate-600">
              Every plan includes {included.join(", ").toLowerCase()}. Extra minutes are ${overagePerMinute.toFixed(2)}{" "}
              each.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border bg-white p-6 ${"featured" in plan ? "border-brand-600 ring-2 ring-brand-600" : "border-slate-200"}`}
                >
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-slate-500">{plan.for}</p>
                  <p className="mt-6">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-slate-500">/month</span>
                  </p>
                  <p className="mt-2 text-slate-700">{plan.minutes} call minutes included</p>
                  <a
                    href={`${dashboardUrl}/signup?plan=${plan.name.toLowerCase()}`}
                    className="mt-6 block rounded-lg bg-brand-600 px-4 py-2 text-center font-medium text-white hover:bg-brand-700"
                  >
                    Choose {plan.name}
                  </a>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-semibold">Hotels, hospitals and large companies</h3>
              <p className="mt-2 text-slate-700">
                Priced per minute and billed by invoice, with department routing, your choice of data region and
                integrations with your booking or scheduling system.
              </p>
              <a href="mailto:sales@example.com" className="mt-4 inline-block font-medium text-brand-600">
                Talk to us →
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500 sm:px-6">
        Callers are always told they are speaking with an AI. © {new Date().getFullYear()} AI Receptionist
      </footer>
    </>
  );
}
