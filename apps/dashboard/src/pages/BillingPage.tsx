import { PageHeader } from "../components/page-header";
import { AddOnsList } from "../features/billing/components/add-ons-list";
import { ChangePlan } from "../features/billing/components/change-plan";
import { InvoicesTable } from "../features/billing/components/invoices-table";
import { PlanSummary } from "../features/billing/components/plan-summary";

export function BillingPage() {
  return (
    <>
      <PageHeader>Your plan, minutes used this month and invoices.</PageHeader>
      <div className="flex flex-col gap-12">
        <PlanSummary />
        <ChangePlan />
        <AddOnsList />
        <InvoicesTable />
      </div>
    </>
  );
}
