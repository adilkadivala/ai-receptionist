import { cn } from "@receptionist/ui/lib/utils";
import { PhoneCall } from "lucide-react";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground",
        className,
      )}
    >
      <PhoneCall className="size-4" />
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2 font-heading font-semibold", className)}>
      <LogoMark />
      AI Receptionist
    </span>
  );
}
