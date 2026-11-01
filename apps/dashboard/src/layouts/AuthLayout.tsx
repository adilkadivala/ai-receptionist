import { Logo } from "@receptionist/ui/blocks/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { cn } from "@receptionist/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * The page around sign-up and login, in the landing page's look: the hero grey with a faint dot grid, the logo, one
 * framed card, and a link to the other form.
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}: {
  /** A short mono label above the title. */
  eyebrow: string;
  title: string;
  description: ReactNode;
  footer: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center gap-6 bg-hero px-4 py-10 sm:justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--color-frame)_1px,transparent_1.2px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <Logo className="relative" />
      <Card className={cn("relative w-full max-w-sm rounded-2xl shadow-xs [--card-spacing:--spacing(6)]", className)}>
        <CardHeader className="gap-2">
          <p className="label-mono">{eyebrow}</p>
          <CardTitle role="heading" aria-level={1} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </CardTitle>
          <CardDescription className="text-pretty">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="relative text-muted-foreground">{footer}</p>
    </main>
  );
}
