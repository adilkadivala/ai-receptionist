import { Logo } from "@receptionist/ui/blocks/logo";
import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { sectionLinks, signupUrl, siteName } from "@/lib/site";
import { MobileNav } from "./mobile-nav";
import { Container } from "./section";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <a href="/" aria-label={`${siteName} home`} className="rounded-lg">
          <Logo />
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {sectionLinks.map((link) => (
            <a key={link.href} href={link.href} className={buttonVariants({ variant: "ghost" })}>
              {link.label}
            </a>
          ))}
          <a href={signupUrl()} className={cn(buttonVariants(), "ms-2")}>
            Get started
          </a>
        </nav>
        <MobileNav links={sectionLinks} signupUrl={signupUrl()} />
      </Container>
    </header>
  );
}
