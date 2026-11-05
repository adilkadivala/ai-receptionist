import { Badge } from "@receptionist/ui/components/badge";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { type Column, DataTable } from "../../../components/data-table";
import { formatDate, formatNumber, formatPhone, formatRelative } from "../../../lib/format";
import { formatMinutes, planName, regionName } from "../format";
import type { AdminOrganization } from "../types";

/** HIPAA mode, where only vendors with a signed BAA may hear the calls. */
export function HipaaBadge() {
  return (
    <Badge className="h-5 border-transparent bg-brand-soft px-2 text-[11px] text-brand-soft-foreground">HIPAA</Badge>
  );
}

const columns: Column<AdminOrganization>[] = [
  {
    id: "customer",
    header: "Customer",
    cell: (customer) => (
      <div className="flex min-w-0 flex-col gap-0.5">
        <Link
          to={`/admin/customers/${customer.id}`}
          className="truncate font-medium outline-none after:absolute after:inset-0 after:rounded-md hover:underline focus-visible:after:ring-3 focus-visible:after:ring-ring/50 focus-visible:after:ring-inset"
        >
          {customer.name}
        </Link>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {planName(customer.plan)} · {regionName(customer.region)}
          {customer.hipaa_mode && <HipaaBadge />}
        </span>
      </div>
    ),
  },
  {
    id: "numbers",
    header: "Numbers",
    className: "hidden @xl/main:table-cell",
    cell: (customer) => <NumberList numbers={customer.phone_numbers.map((number) => number.e164)} />,
  },
  {
    id: "agents",
    header: "Receptionists",
    className: "hidden max-w-56 @4xl/main:table-cell",
    cellClassName: "truncate text-foreground/80",
    cell: (customer) =>
      customer.agents.length ? (
        customer.agents.map((agent) => agent.name).join(", ")
      ) : (
        <span className="text-muted-foreground">None</span>
      ),
  },
  {
    id: "calls",
    header: "Calls",
    className: "text-end",
    cellClassName: "font-medium tabular-nums",
    cell: (customer) => formatNumber(customer.calls),
  },
  {
    id: "minutes",
    header: "Minutes",
    className: "hidden text-end @lg/main:table-cell",
    cellClassName: "tabular-nums",
    cell: (customer) => formatMinutes(customer.call_seconds),
  },
  {
    id: "last-call",
    header: "Last call",
    className: "text-end",
    cellClassName: "text-[13px] text-muted-foreground",
    cell: (customer) =>
      customer.last_call_at ? (
        <time dateTime={customer.last_call_at}>{formatRelative(customer.last_call_at)}</time>
      ) : (
        "No calls yet"
      ),
  },
  {
    id: "since",
    header: "Customer since",
    className: "hidden text-end @5xl/main:table-cell",
    cellClassName: "text-[13px] text-muted-foreground",
    cell: (customer) => <time dateTime={customer.created_at}>{formatDate(customer.created_at)}</time>,
  },
];

/** A customer's numbers in mono, the first two and then how many more. */
function NumberList({ numbers }: { numbers: readonly string[] }): ReactNode {
  if (numbers.length === 0) return <span className="text-muted-foreground">No number</span>;
  return (
    <span className="flex flex-col gap-0.5 font-mono text-[13px] tabular-nums">
      {numbers.slice(0, 2).map((number) => (
        <span key={number}>{formatPhone(number)}</span>
      ))}
      {numbers.length > 2 && (
        <span className="font-sans text-xs text-muted-foreground">+{numbers.length - 2} more</span>
      )}
    </span>
  );
}

/** Every customer as a row, the whole row a link to the customer. */
export function CustomersTable({
  customers,
  loading,
  empty,
}: {
  customers: readonly AdminOrganization[] | undefined;
  loading: boolean;
  empty: ReactNode;
}) {
  return (
    <DataTable
      caption="Every customer, newest first, with their numbers, receptionists and calls."
      columns={columns}
      rows={customers}
      getRowId={(customer) => customer.id}
      loading={loading}
      empty={empty}
    />
  );
}
