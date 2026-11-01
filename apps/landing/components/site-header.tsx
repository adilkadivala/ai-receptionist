import { Logo } from "@receptionist/ui/blocks/logo";
import { buttonVariants } from "@receptionist/ui/components/button";
import { cn } from "@receptionist/ui/lib/utils";
import { MobileNav } from "./mobile-nav";

const links = [
  { href: "#who", label: "Who it's for" },
  { href: "#languages", label: "Languages" },
  { href: "#pricing", label: "Pricing" },
];

export function SiteHeader({ signupUrl }: { signupUrl: string }) {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="/" aria-label="AI Receptionist home">
          <Logo />
        </a>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className={buttonVariants({ variant: "ghost" })}>
              {link.label}
            </a>
          ))}
          <a href={signupUrl} className={cn(buttonVariants(), "ms-2")}>
            Get started
          </a>
        </nav>
        <MobileNav links={links} signupUrl={signupUrl} />
      </div>
    </header>
  );
}
