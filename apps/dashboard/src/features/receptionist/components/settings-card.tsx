import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@receptionist/ui/components/card";
import type { ReactNode } from "react";
import type { Errors } from "../../../lib/validation";
import type { AgentSettings } from "../types";

/** What every section of the receptionist form gets from the form. */
export type SectionProps = {
  values: AgentSettings;
  set: <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => void;
  errors: Errors;
};

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
    <Card>
      <CardHeader>
        <CardTitle id={titleId} role="heading" aria-level={2}>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
