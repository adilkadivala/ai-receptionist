import { LogoMark } from "@receptionist/ui/blocks/logo";
import { cn } from "@receptionist/ui/lib/utils";
import { accountsOpen, bookDemoHref, loginUrl, sectionLinks, siteName } from "@/lib/site";
import { BookDemoLink, ctaClassName } from "./cta-links";
import { MobileNav } from "./mobile-nav";
import { gutter } from "./section";

// "ink" is white on the blueprint (the home page's hero); "light" is the default on the hero grey (legal pages).
const tones = {
  light: {
    link: "text-foreground/80 hover:bg-foreground/5 hover:text-foreground",
    login: "bg-transparent text-foreground shadow-none hover:bg-foreground/5",
    cta: "default",
    menu: "",
  },
  ink: {
    link: "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground",
    login: "bg-transparent text-primary-foreground/90 shadow-none hover:bg-primary-foreground/10",
    cta: "inverse",
    menu: "text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground dark:hover:bg-primary-foreground/10",
  },
} as const;

/** The top bar, 72 px tall, placed by each page at the top of its first band. */
export function SiteHeader({ tone = "light", className }: { tone?: keyof typeof tones; className?: string }) {
  const style = tones[tone];
  return (
    <header className={cn("relative z-20 flex h-18 items-center justify-between gap-4", gutter, className)}>
      <a href="/" className="flex items-center gap-2.5 rounded-lg font-semibold tracking-[-0.01em]">
        <LogoMark className="size-7.5 rounded-[8px] shadow-[inset_0_1px_0_color-mix(in_oklch,white_25%,transparent)]" />
        {siteName}
      </a>
      <nav aria-label="Main" className="hidden gap-1 lg:flex">
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={cn("rounded-lg px-3 py-2 text-sm transition-colors", style.link)}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        {accountsOpen && (
          <a
            href={loginUrl}
            className={ctaClassName({ size: "sm", className: cn("hidden lg:inline-flex", style.login) })}
          >
            Log in
          </a>
        )}
        <BookDemoLink size="sm" variant={style.cta} />
        <MobileNav
          links={sectionLinks}
          loginUrl={accountsOpen ? loginUrl : undefined}
          bookDemoUrl={bookDemoHref()}
          triggerClassName={style.menu}
        />
      </div>
    </header>
  );
}
