import { Button } from "@receptionist/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatNumber } from "../lib/format";

/** "21–40 of 143" with previous and next buttons. Hidden when everything fits on one page. */
export function Pager({
  page,
  pageSize,
  total,
  onPageChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (total <= pageSize) return null;
  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  return (
    <nav aria-label="Pages" className="flex items-center justify-between gap-4">
      <p className="text-muted-foreground tabular-nums">
        {formatNumber(first)}–{formatNumber(last)} of {formatNumber(total)}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft data-icon="inline-start" className="rtl:rotate-180" />
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={last >= total} onClick={() => onPageChange(page + 1)}>
          Next
          <ChevronRight data-icon="inline-end" className="rtl:rotate-180" />
        </Button>
      </div>
    </nav>
  );
}
