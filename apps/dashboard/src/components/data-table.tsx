import { Skeleton } from "@receptionist/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@receptionist/ui/components/table";
import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";

export type Column<T> = {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  /** Applied to the header and every cell, e.g. "hidden md:table-cell" or "text-end". */
  className?: string;
  /** Applied to the body cells only, e.g. a mono font for lengths. */
  cellClassName?: string;
};

/**
 * A table from column definitions, with loading rows and an empty state, in the Signal style: small muted headers,
 * hairline rows and roomy cells that start in line with the card's edge.
 * To make a whole row clickable, render a link in one cell with `after:absolute after:inset-0`: the row is
 * `relative`, so the link covers it while keyboard and screen-reader users get one ordinary link per row.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  caption,
  loading,
  empty,
  loadingRows = 5,
}: {
  columns: Column<T>[];
  rows: readonly T[] | undefined;
  getRowId: (row: T) => string;
  /** Read by screen readers only. */
  caption: string;
  loading?: boolean;
  empty?: ReactNode;
  loadingRows?: number;
}) {
  const cell = "px-3 first:ps-4 last:pe-4 lg:first:ps-5 lg:last:pe-5";

  return (
    <Table>
      <TableCaption className="sr-only">{caption}</TableCaption>
      <TableHeader className="[&_tr]:border-b-border/70">
        <TableRow className="hover:bg-transparent">
          {columns.map((column) => (
            <TableHead key={column.id} className={cn(cell, "text-xs text-muted-foreground", column.className)}>
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: loadingRows }, (_, row) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have nothing else to key on
              <TableRow key={row} className="border-border/70 hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.id} className={cn(cell, "py-3.5", column.className)}>
                    <Skeleton className="h-4 w-full max-w-32" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows?.map((row) => (
              <TableRow key={getRowId(row)} className="relative border-border/70">
                {columns.map((column) => (
                  <TableCell key={column.id} className={cn(cell, "py-3", column.className, column.cellClassName)}>
                    {column.cell(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        {!loading && rows?.length === 0 && (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columns.length} className="whitespace-normal">
              {empty}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
