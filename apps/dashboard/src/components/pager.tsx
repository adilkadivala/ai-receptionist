import { Button } from "@receptionist/ui/components/button";
import { formatNumber } from "../lib/format";
import { resting } from "./surfaces";

/** The table's footer: "Showing 21–40 of 143 calls" with Previous and Next. */
export function Pager({
  page,
  pageSize,
  total,
  noun,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  /** Plural, e.g. "calls". */
  noun: string;
  onPageChange: (page: number) => void;
}) {
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label="Pages"
      className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-3 lg:px-5"
    >
      <p className="text-[13px] text-muted-foreground tabular-nums" aria-live="polite">
        {total <= pageSize
          ? `Showing ${formatNumber(total)} ${noun}`
          : `Showing ${formatNumber(first)}–${formatNumber(last)} of ${formatNumber(total)} ${noun}`}
      </p>
      {total > pageSize && (
        <div className="flex gap-2">
          <Button variant="outline" className={resting} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" className={resting} disabled={last >= total} onClick={() => onPageChange(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </nav>
  );
}
