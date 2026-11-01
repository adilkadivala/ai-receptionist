import { PageHeader } from "../components/page-header";
import { CallLog } from "../features/calls/components/call-log";
import { CallSheet } from "../features/calls/components/call-sheet";

export function CallsPage() {
  return (
    <>
      <PageHeader title="Calls">Every call with its transcript, summary, language and outcome.</PageHeader>
      <CallLog />
      <CallSheet />
    </>
  );
}
