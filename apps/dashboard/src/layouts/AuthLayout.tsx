import { Logo } from "@receptionist/ui/blocks/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import type { ReactNode } from "react";

/** The page around sign-up and login: the logo, one card, and a link to the other form. */
export function AuthLayout({
  title,
  description,
  footer,
  className,
  children,
}: {
  title: string;
  description: ReactNode;
  footer: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-svh flex-col items-center gap-6 bg-muted/40 px-4 py-10 sm:justify-center">
      <Logo />
      <Card className={className ?? "w-full max-w-sm"}>
        <CardHeader>
          <CardTitle role="heading" aria-level={1} className="text-xl">
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="text-muted-foreground">{footer}</p>
    </main>
  );
}
