import { badgeVariants } from "@receptionist/ui/components/badge";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@receptionist/ui/components/popover";
import { cn } from "@receptionist/ui/lib/utils";
import { FlaskConical } from "lucide-react";

// MOCK: remove once every hook in src/features/*/api.ts calls the api.
/** Says plainly that what's on screen is sample data, until the api routes exist. */
export function SampleDataBadge({ className }: { className?: string }) {
  return (
    <Popover>
      <PopoverTrigger className={cn(badgeVariants({ variant: "outline" }), "h-6 cursor-pointer", className)}>
        <FlaskConical data-icon="inline-start" />
        Sample data
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <PopoverTitle>You're looking at sample data</PopoverTitle>
        <PopoverDescription>
          The api only has a health check so far. Calls, settings, numbers and billing come from built-in samples, and
          changes last until you reload. Server status on the Overview is live.
        </PopoverDescription>
      </PopoverContent>
    </Popover>
  );
}
