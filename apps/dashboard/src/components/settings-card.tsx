import { Eyebrow } from "@receptionist/ui/blocks/drafting";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@receptionist/ui/components/card";
import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";
import { raised } from "./surfaces";

/**
 * One group of settings resting on the sheet, titled like a landing page section (a bracketed blue label) with an
 * optional action at the end of its header.
 */
export function SettingsCard({
  title,
  titleId,
  description,
  action,
  children,
}: {
  title: string;
  titleId?: string;
  description: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className={cn(raised, "gap-5 [--card-spacing:--spacing(5)]")}>
      <CardHeader className="gap-2">
        <Eyebrow as="h2" id={titleId}>
          {title}
        </Eyebrow>
        <CardDescription className="text-pretty text-foreground/70">{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
