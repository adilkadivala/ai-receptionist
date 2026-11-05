import { Button } from "@receptionist/ui/components/button";
import { Input } from "@receptionist/ui/components/input";
import { cn } from "@receptionist/ui/lib/utils";
import { Building2, Search, SearchX } from "lucide-react";
import { useId } from "react";
import { useSearchParams } from "react-router";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { QueryError } from "../../components/query-error";
import { floating, resting } from "../../components/surfaces";
import { useAdminOrganizations } from "../../features/admin/api";
import { CustomersTable } from "../../features/admin/components/customers-table";
import { matchesCustomer } from "../../features/admin/filter";
import { formatNumber } from "../../lib/format";

/** Every customer, newest first, searchable by name or phone number. The search is in the URL (?q=). */
export function AdminCustomersPage() {
  const id = useId();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const customers = useAdminOrganizations();
  const shown = customers.data?.filter((customer) => matchesCustomer(customer, query));
  const setQuery = (q: string) => setParams(q ? { q } : {}, { replace: true });

  return (
    <>
      <PageHeader
        actions={
          <div className="relative w-full sm:w-72">
            <label htmlFor={id} className="sr-only">
              Search customers by name or phone number
            </label>
            <Search
              aria-hidden
              className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id={id}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name or phone number"
              className="ps-8"
            />
          </div>
        }
      >
        {customers.data
          ? `${formatNumber(customers.data.length)} ${customers.data.length === 1 ? "customer" : "customers"}, newest first. Open one for its numbers, receptionists and calls.`
          : "Every customer, newest first."}
      </PageHeader>
      {customers.isError ? (
        <QueryError title="Couldn't load the customers" onRetry={() => customers.refetch()}>
          Check that the api is running on this computer. It refuses admin requests from anywhere else.
        </QueryError>
      ) : (
        <section aria-label="Customers" className={cn(floating, "overflow-hidden")}>
          <CustomersTable
            customers={shown}
            loading={customers.isPending}
            empty={
              query ? (
                <EmptyState
                  icon={SearchX}
                  title="No customer matches"
                  action={
                    <Button variant="outline" className={resting} onClick={() => setQuery("")}>
                      Clear search
                    </Button>
                  }
                >
                  Try part of the name, or a few digits of one of their numbers.
                </EmptyState>
              ) : (
                <EmptyState icon={Building2} title="No customers yet">
                  Customers show up here as soon as their organization is in the database.
                </EmptyState>
              )
            }
          />
        </section>
      )}
    </>
  );
}
