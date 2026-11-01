import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@receptionist/ui/components/card";
import type { ReactNode } from "react";

/** A titled card holding one group of settings, with an optional action at the end of its header. */
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
    <Card className="shadow-xs">
      <CardHeader>
        <CardTitle id={titleId} role="heading" aria-level={2} className="text-[15px] font-semibold">
          {title}
        </CardTitle>
        <CardDescription className="text-pretty">{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
