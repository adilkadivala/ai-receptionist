import { formatUsd } from "@receptionist/product";
import { cn } from "@receptionist/ui/lib/utils";
import { AudioLines, Check, PhoneCall, Plus, Search } from "lucide-react";
import type { ReactNode } from "react";
import { dashboardPreview, type PreviewPage } from "@/content/dashboard-preview";
import { CountUp } from "./motion/count-up";
import { OutcomePill } from "./outcome-pill";

// The five pages of the hero's dashboard preview, drawn in HTML with sample data. Only the tabs above them work:
// the controls drawn inside are pictures, so they're spans, not buttons.

const { overview, calls, receptionist, numbers, billing } = dashboardPreview;

// The middle columns of a table drop below the sm breakpoint, so it fits a phone without scrolling sideways.
const wideOnly = "hidden sm:table-cell";
const page = "px-[18px] py-4";

type Call = (typeof calls.log)[number];

function CallsTable({ rows }: { rows: readonly Call[] }) {
  return (
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
        {rows.map((call) => (
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
  );
}

/** A small label above a setting, as the dashboard's forms show them. */
function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function OverviewPage() {
  return (
    <div className="pb-[18px]">
      <dl className="grid grid-cols-2 gap-2.5 px-[18px] py-4 lg:grid-cols-4">
        {overview.stats.map((stat) => (
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
      <div className="px-[18px]">
        <CallsTable rows={overview.calls} />
      </div>
    </div>
  );
}

function CallsPage() {
  return (
    <div className={cn(page, "flex flex-col gap-3")}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex h-8 min-w-[200px] flex-1 items-center gap-2 rounded-[9px] border px-2.5 text-[13px] text-muted-foreground">
          <Search aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{calls.search}</span>
        </span>
        <span className="flex flex-wrap gap-1">
          {calls.filters.map((filter, index) => (
            <span
              key={filter}
              className={cn(
                "inline-flex h-7 items-center rounded-full px-2.5 text-xs",
                index === 0 ? "bg-foreground text-background" : "border text-foreground/70",
              )}
            >
              {filter}
            </span>
          ))}
        </span>
      </div>
      <CallsTable rows={calls.log} />
    </div>
  );
}

function ReceptionistPage() {
  return (
    <div className={cn(page, "grid gap-4 text-[13px] lg:grid-cols-[1.4fr_1fr]")}>
      <div className="flex flex-col gap-4">
        <Field label="Greeting">
          <p className="rounded-[10px] border bg-muted/40 px-3 py-2.5 leading-relaxed">{receptionist.greeting}</p>
        </Field>
        <Field label="Voice">
          <p className="flex items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-soft text-brand-soft-foreground">
              <AudioLines aria-hidden className="size-3.5" />
            </span>
            {receptionist.voice}
          </p>
        </Field>
        <Field label="Urgent calls go to">
          <ul className="flex flex-col divide-y divide-border/60 rounded-[10px] border">
            {receptionist.transfers.map((transfer) => (
              <li key={transfer.when} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="text-foreground/80">{transfer.when}</span>
                <span className="shrink-0 font-medium">{transfer.to}</span>
              </li>
            ))}
          </ul>
        </Field>
      </div>
      <Field label="Opening hours">
        <ul className="flex flex-col divide-y divide-border/60 rounded-[10px] border">
          {receptionist.hours.map((row) => (
            <li key={row.days} className="flex items-center justify-between gap-3 px-3 py-2">
              <span className="text-foreground/80">{row.days}</span>
              <span className={cn("font-mono text-xs", row.time === "Closed" && "text-muted-foreground")}>
                {row.time}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-1 text-xs text-muted-foreground">
          Outside these hours it still answers, and takes a message.
          <br />
          {receptionist.questions} common questions answered.
        </p>
      </Field>
    </div>
  );
}

function NumbersPage() {
  return (
    <div className={cn(page, "flex flex-col gap-2.5 text-[13px]")}>
      {numbers.map((number) => (
        <div
          key={number.number}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border p-3.5"
        >
          <div className="flex items-center gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand-soft text-brand-soft-foreground">
              <PhoneCall aria-hidden className="size-4" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p dir="ltr" className="font-mono font-medium">
                {number.number}
              </p>
              <p className="text-xs text-muted-foreground">
                {number.label} · {number.detail}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{number.calls} calls this month</span>
            <span className="inline-flex h-7 items-center rounded-[8px] border px-2.5 text-xs font-medium">
              Test call
            </span>
          </div>
        </div>
      ))}
      <span className="flex h-11 items-center justify-center gap-1.5 rounded-[12px] border border-dashed text-muted-foreground">
        <Plus aria-hidden className="size-3.5" />
        Add a number
      </span>
    </div>
  );
}

function BillingPage() {
  const { plan, addOn, minutesUsed, renews, invoices } = billing;
  const used = Math.min(100, (minutesUsed / plan.minutes) * 100);
  return (
    <div className={cn(page, "grid gap-4 text-[13px] lg:grid-cols-[1fr_1.25fr]")}>
      <div className="flex flex-col gap-3.5 rounded-[12px] border p-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-semibold">{plan.name} plan</p>
          <p>
            <span className="text-2xl font-semibold tracking-[-0.03em]">{formatUsd(plan.price)}</span>
            <span className="text-xs text-muted-foreground"> / month</span>
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="flex justify-between text-xs text-muted-foreground">
            Minutes used
            <span className="text-foreground">
              {minutesUsed} / {plan.minutes}
            </span>
          </p>
          <span className="h-2 overflow-hidden rounded-full bg-muted">
            <span className="block h-full rounded-full bg-primary" style={{ width: `${used}%` }} />
          </span>
        </div>
        <p className="flex justify-between border-t border-border/60 pt-3">
          <span className="text-foreground/80">{addOn.name}</span>
          <span className="font-medium">{formatUsd(addOn.price)} / month</span>
        </p>
        <p className="text-xs text-muted-foreground">Renews {renews}</p>
      </div>
      <table className="w-full self-start border-collapse">
        <thead>
          <tr className="text-xs text-muted-foreground">
            <th scope="col" className="py-2 text-start font-medium">
              Invoice
            </th>
            <th scope="col" className={cn("p-2 text-start font-medium", wideOnly)}>
              For
            </th>
            <th scope="col" className="p-2 text-end font-medium">
              Amount
            </th>
            <th scope="col" className="py-2 text-end font-medium">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.date} className="border-t border-border/60">
              <td className="py-2.5 font-medium">{invoice.date}</td>
              <td className={cn("px-2 py-2.5 text-foreground/80", wideOnly)}>{invoice.note}</td>
              <td className="px-2 py-2.5 text-end tabular-nums">{formatUsd(invoice.amount)}</td>
              <td className="py-2.5 text-end text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Check aria-hidden className="size-3.5" />
                  Paid
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const previewPageViews: Record<PreviewPage, () => ReactNode> = {
  Calls: CallsPage,
  Overview: OverviewPage,
  Receptionist: ReceptionistPage,
  "Phone numbers": NumbersPage,
  Billing: BillingPage,
};
