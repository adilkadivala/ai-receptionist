import { cn } from "@receptionist/ui/lib/utils";
import { dashboardPreview } from "@/content/dashboard-preview";
import { LiveDot } from "./live-dot";
import { CountUp } from "./motion/count-up";
import { OutcomePill } from "./outcome-pill";

const { business, page, tabs, status, stats, calls } = dashboardPreview;

// The two middle columns drop below the sm breakpoint so the table fits a phone without scrolling sideways.
const wideOnly = "hidden sm:table-cell";

/** The hero's product shot: the dashboard's tab bar and overview page, drawn in HTML with sample data. */
export function DashboardPreview() {
  return (
    <figure>
      <figcaption className="sr-only">Example of the dashboard's overview page, with sample data.</figcaption>
      <div
        aria-hidden
        className="inline-flex flex-wrap justify-center gap-0.5 rounded-[12px] bg-card p-1 shadow-[0_8px_24px_-12px_color-mix(in_oklch,var(--foreground)_35%,transparent)]"
      >
        {tabs.map((tab) => (
          <span
            key={tab}
            className={cn(
              "inline-flex h-8 items-center rounded-[9px] px-3 text-[13px] text-foreground/70",
              tab === page && "bg-hero font-medium text-foreground",
            )}
          >
            {tab}
          </span>
        ))}
      </div>

      <div className="mx-auto mt-7 max-w-[1060px] rounded-t-[20px] border border-b-0 border-primary-foreground/30 bg-primary-foreground/15 p-2.5 pb-0">
        <div className="overflow-hidden rounded-t-[12px] bg-card text-start">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-[18px] py-3.5">
            <p className="flex items-center gap-2.5">
              <span className="text-sm font-semibold">{business}</span>
              <span className="hidden text-[13px] text-muted-foreground sm:inline">{page}</span>
            </p>
            <span className="inline-flex h-6.5 shrink-0 items-center gap-1.5 rounded-full bg-success-soft px-2.5 text-xs font-medium whitespace-nowrap text-success-foreground">
              <LiveDot />
              {status}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-2.5 px-[18px] py-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1.5 rounded-[12px] border p-3.5">
                <dt className="text-xs text-muted-foreground">{stat.label}</dt>
                <dd className="text-2xl font-semibold tracking-[-0.03em]">
                  <CountUp value={stat.value} />
                  {stat.of && (
                    <span className="text-sm font-normal tracking-normal text-muted-foreground"> / {stat.of}</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <div className="px-[18px] pb-[18px]">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-xs text-muted-foreground">
                  <th scope="col" className="py-2 text-start font-medium">
                    Caller
                  </th>
                  <th scope="col" className={cn("p-2 text-start font-medium", wideOnly)}>
                    What they needed
                  </th>
                  <th scope="col" className={cn("p-2 text-start font-medium", wideOnly)}>
                    Language
                  </th>
                  <th scope="col" className="p-2 text-start font-medium">
                    Outcome
                  </th>
                  <th scope="col" className="py-2 text-end font-medium">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {calls.map((call) => (
                  <tr key={call.caller} className="border-t border-border/60">
                    <td className="py-2.5 font-medium">{call.caller}</td>
                    <td className={cn("px-2 py-2.5 text-foreground/80", wideOnly)}>{call.need}</td>
                    <td className={cn("px-2 py-2.5 text-foreground/80", wideOnly)}>{call.language}</td>
                    <td className="px-2 py-2.5">
                      <OutcomePill outcome={call.outcome} />
                    </td>
                    <td className="py-2.5 text-end whitespace-nowrap text-muted-foreground">{call.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </figure>
  );
}
