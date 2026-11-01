import { Check } from "lucide-react";

/** A plain list with a blue check before each item. Layout (grid, columns) comes from `className`. */
export function CheckList({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={className}>
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  );
}
