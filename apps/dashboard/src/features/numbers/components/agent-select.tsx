import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@receptionist/ui/components/select";
import { cn } from "@receptionist/ui/lib/utils";
import type { ComponentProps } from "react";
import type { Agent } from "../../receptionist/types";

const nobody = "none";

/** Picks which receptionist answers a number, or nobody. */
export function AgentSelect({
  agents,
  value,
  onValueChange,
  disabled,
  className,
  ...trigger
}: {
  agents: readonly Agent[];
  value: string | null;
  onValueChange: (agentId: string | null) => void;
  disabled?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof SelectTrigger>, "value" | "onChange">) {
  const items = [
    ...agents.map((agent) => ({ value: agent.id, label: agent.name })),
    { value: nobody, label: "Nobody" },
  ];

  return (
    <Select
      items={items}
      value={value ?? nobody}
      onValueChange={(next) => onValueChange(next === nobody || !next ? null : next)}
      disabled={disabled}
    >
      <SelectTrigger {...trigger} className={cn("min-w-40", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
