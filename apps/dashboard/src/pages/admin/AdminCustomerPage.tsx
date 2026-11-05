import { HatchBand } from "@receptionist/ui/blocks/drafting";
import { buttonVariants } from "@receptionist/ui/components/button";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowLeft, SearchX } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { QueryError } from "../../components/query-error";
import { SectionTitle } from "../../components/section-title";
import { StatCard } from "../../components/stat-card";
import { AdminApiError, useAdminOrganization } from "../../features/admin/api";
import { AdminCallSheet } from "../../features/admin/components/call-sheet";
import { CustomerCalls } from "../../features/admin/components/customer-calls";
import { CustomerAgents, CustomerNumbers } from "../../features/admin/components/customer-setup";
import { HipaaBadge } from "../../features/admin/components/customers-table";
import { formatMinutes, planName, regionName } from "../../features/admin/format";
import { formatDate, formatDateTime, formatNumber, formatRelative } from "../../lib/format";

const backLink =
  "inline-flex items-center gap-1.5 self-start text-[13px] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline";

/** One customer: its plan, numbers and receptionists, then its calls, newest first. A call opens in a sheet. */
export function AdminCustomerPage() {
  const { id = "" } = useParams();
  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get("page")) || 1);
  const customer = useAdminOrganization(id);
  const data = customer.data;

  if (customer.error instanceof AdminApiError && customer.error.status === 404) {
    return (
      <EmptyState
        icon={SearchX}
        title="There's no such customer"
        action={
          <Link to="/admin/customers" className={buttonVariants()}>
            See every customer
          </Link>
        }
      >
        It may have been deleted, or the link is wrong.
      </EmptyState>
    );
  }
  if (customer.isError) {
    return (
      <QueryError title="Couldn't load this customer" onRetry={() => customer.refetch()}>
        Check that the api is running on this computer. It refuses admin requests from anywhere else.
      </QueryError>
    );
  }

  return (
    <>
      <Link to="/admin/customers" className={cn(backLink, "mb-4")}>
        <ArrowLeft aria-hidden className="size-3.5 rtl:rotate-180" />
        All customers
      </Link>
      <PageHeader
        eyebrow="Customer"
        title={data?.name ?? <Skeleton className="h-8 w-56" />}
        actions={data?.hipaa_mode && <HipaaBadge />}
      >
        {data
          ? `${planName(data.plan)} plan · data kept in ${regionName(data.region)} · customer since ${formatDate(data.created_at)}`
          : " "}
      </PageHeader>
      <HatchBand className="-mx-4 h-6 lg:-mx-6" />
      <section
        aria-label="This customer's totals"
        className="-mx-4 grid grid-cols-2 gap-px border-b bg-border *:bg-background lg:-mx-6 @3xl/main:grid-cols-4"
      >
        <StatCard label="Calls" loading={!data} value={data && formatNumber(data.calls)} hint="Since they joined" />
        <StatCard
          label="Minutes"
          loading={!data}
          value={data && formatMinutes(data.call_seconds)}
          hint="Talk time, every call"
        />
        <StatCard
          label="Last call"
          loading={!data}
          // Words, not a count, so a size down from the other numbers.
          value={
            data && (
              <span className="text-2xl tracking-[-0.025em]">
                {data.last_call_at ? formatRelative(data.last_call_at) : "None yet"}
              </span>
            )
          }
          hint={data?.last_call_at ? formatDateTime(data.last_call_at) : "No calls yet"}
        />
        <StatCard
          label="Numbers"
          loading={!data}
          value={data && formatNumber(data.phone_numbers.length)}
          hint={
            data &&
            `${formatNumber(data.agents.length)} ${data.agents.length === 1 ? "receptionist" : "receptionists"} set up`
          }
        />
      </section>

      {data && (
        <div className="mt-8 grid gap-6 @3xl/main:grid-cols-2">
          <CustomerNumbers customer={data} />
          <CustomerAgents customer={data} />
        </div>
      )}

      <section aria-labelledby="customer-calls" className="mt-10 flex flex-col gap-4">
        <SectionTitle
          id="customer-calls"
          title="Calls"
          description="Newest first. Open one for its transcript and summary."
        />
        <CustomerCalls
          customerId={id}
          page={page}
          onPageChange={(next) => setParams(next > 1 ? { page: String(next) } : {})}
        />
      </section>
      <AdminCallSheet customerName={data?.name} />
    </>
  );
}
