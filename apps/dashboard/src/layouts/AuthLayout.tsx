import { Blueprint } from "@receptionist/ui/blocks/blueprint";
import { Eyebrow } from "@receptionist/ui/blocks/drafting";
import { Logo } from "@receptionist/ui/blocks/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@receptionist/ui/components/card";
import { cn } from "@receptionist/ui/lib/utils";
import type { CSSProperties, ReactNode } from "react";

// The pieces rise in one after another with .animate-rise (globals.css), as in the landing page's hero.
const after = (ms: number) => ({ "--rise-delay": `${ms}ms` }) as CSSProperties;

/**
 * The page around sign-up and login, drawn like the landing page's hero: the logo and one white card lying on the
 * blueprint, with a link to the other form under it.
 */
export function AuthLayout({
  eyebrow,
  title,
  description,
  footer,
  className,
  children,
}: {
  /** A short label above the title, in drafting brackets. */
  eyebrow: string;
  title: string;
  description: ReactNode;
  footer: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <main className="relative flex min-h-svh flex-col items-center gap-6 overflow-hidden bg-(--ink) px-4 pt-14 pb-10 text-primary-foreground sm:justify-center sm:pt-10">
      <Blueprint />
      <Logo className="animate-rise relative [&>span]:shadow-[inset_0_1px_0_color-mix(in_oklch,white_25%,transparent)]" />
      <Card
        className={cn(
          "animate-rise relative w-full max-w-sm rounded-[20px] shadow-[0_24px_48px_-16px_black] ring-0 [--card-spacing:--spacing(6)]",
          className,
        )}
        style={after(90)}
      >
        <CardHeader className="gap-2">
          <Eyebrow className="mb-1">{eyebrow}</Eyebrow>
          <CardTitle role="heading" aria-level={1} className="text-2xl font-semibold tracking-[-0.03em]">
            {title}
          </CardTitle>
          <CardDescription className="text-pretty text-foreground/70">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      <p className="animate-rise relative text-primary-foreground/72" style={after(180)}>
        {footer}
      </p>
    </main>
  );
}

/** The link to the other form, white on the blueprint. */
export const authLinkClassName = "font-medium text-primary-foreground underline underline-offset-4 hover:no-underline";
