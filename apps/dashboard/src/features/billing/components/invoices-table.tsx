import { formatUsd } from "@receptionist/product";
import { Badge } from "@receptionist/ui/components/badge";
import { cn } from "@receptionist/ui/lib/utils";
import { ReceiptText } from "lucide-react";
import { type Column, DataTable } from "../../../components/data-table";
import { EmptyState } from "../../../components/empty-state";
import { QueryError } from "../../../components/query-error";
import { SectionTitle } from "../../../components/section-title";
import { raised } from "../../../components/surfaces";
import { formatDate } from "../../../lib/format";
import { useInvoices } from "../api";
import type { Invoice, InvoiceStatus } from "../types";

const statuses: Record<InvoiceStatus, { label: string; className: string }> = {
  // Status colours belong to call outcomes, so a paid invoice stays neutral.
  paid: { label: "Paid", className: "text-foreground/80" },
  open: { label: "Due", className: "border-transparent bg-secondary text-secondary-foreground" },
  failed: { label: "Payment failed", className: "border-transparent bg-destructive/10 text-destructive" },
  void: { label: "Void", className: "text-muted-foreground" },
};

const columns: Column<Invoice>[] = [
  {
    id: "number",
    header: "Invoice",
    cell: (invoice) => <span className="font-mono text-[13px] font-medium">{invoice.number}</span>,
  },
  {
    id: "period",
    header: "Period",
    className: "hidden sm:table-cell",
    cell: (invoice) => `${formatDate(invoice.period_start)} to ${formatDate(invoice.period_end)}`,
  },
  {
    id: "items",
    header: "Items",
    className: "hidden w-full max-w-0 lg:table-cell",
    cell: (invoice) => (
      <p className="truncate text-muted-foreground">{invoice.lines.map((line) => line.description).join(", ")}</p>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (invoice) => (
      <Badge variant="outline" className={cn(statuses[invoice.status].className)}>
        {statuses[invoice.status].label}
      </Badge>
    ),
  },
  {
    id: "amount",
    header: "Amount",
    className: "text-end",
    cellClassName: "font-medium tabular-nums",
    cell: (invoice) => formatUsd(invoice.amount_usd),
  },
];

export function InvoicesTable() {
  const invoices = useInvoices();

  return (
    <section aria-labelledby="invoices-title" className="flex flex-col gap-4">
      <SectionTitle id="invoices-title" title="Invoices" description="One a month, paid with the card on file." />
      {invoices.isError ? (
        <QueryError title="Couldn't load your invoices" onRetry={() => invoices.refetch()} />
      ) : (
        <div className={cn(raised, "overflow-hidden")}>
          <DataTable
            caption="Invoices, newest first."
            columns={columns}
            rows={invoices.data}
            getRowId={(invoice) => invoice.id}
            loading={invoices.isPending}
            loadingRows={3}
            empty={
              <EmptyState icon={ReceiptText} title="No invoices yet">
                Your first invoice arrives at the end of your first month.
              </EmptyState>
            }
          />
        </div>
      )}
    </section>
  );
}
