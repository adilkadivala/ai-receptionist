import { LogoMark } from "@receptionist/ui/blocks/logo";
import { loginUrl, sectionLinks, signupUrl, siteName } from "@/lib/site";
import { ctaClassName, GetStartedLink } from "./cta-links";
import { MobileNav } from "./mobile-nav";
import { gutter } from "./section";

/** Lies over the top of each page's first band (72 px tall), on the hero grey and its pixel field. */
export function SiteHeader() {
  return (
    <header className={`absolute inset-x-0 top-0 z-20 flex h-18 items-center justify-between gap-4 ${gutter}`}>
      <a href="/" className="flex items-center gap-2.5 rounded-lg font-semibold tracking-[-0.01em]">
        <LogoMark className="size-7.5 rounded-[8px]" />
        {siteName}
      </a>
      <nav aria-label="Main" className="hidden gap-1 lg:flex">
        {sectionLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="flex items-center gap-2">
        <a
          href={loginUrl}
          className={ctaClassName({
            size: "sm",
            className: "hidden bg-transparent text-foreground hover:bg-foreground/5 lg:inline-flex",
          })}
        >
          Log in
        </a>
        <GetStartedLink size="sm" />
        <MobileNav links={sectionLinks} loginUrl={loginUrl} signupUrl={signupUrl()} />
      </div>
    </header>
  );
}
