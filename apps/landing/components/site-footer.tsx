import { Logo } from "@receptionist/ui/blocks/logo";
import { legalLinks, type NavLink, salesEmail, sectionLinks, siteName } from "@/lib/site";
import { Container } from "./section";

function FooterLinks({ title, links }: { title: string; links: NavLink[] }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-medium">{title}</h2>
      <ul className="mt-3 space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="inline-block py-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t">
      <Container className="grid grid-cols-2 gap-10 py-12 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]">
        <div className="col-span-2 max-w-xs lg:col-span-1">
          <Logo />
          <p className="mt-4 text-sm text-pretty text-muted-foreground">
            An AI receptionist that answers your calls 24/7. Callers are always told they're speaking with an AI.
          </p>
        </div>
        <FooterLinks title="Product" links={sectionLinks} />
        <FooterLinks title="Contact" links={[{ href: `mailto:${salesEmail}`, label: salesEmail }]} />
        <FooterLinks title="Legal" links={legalLinks} />
      </Container>
      <Container className="border-t py-6 text-sm text-muted-foreground">
        © {new Date().getFullYear()} {siteName}
      </Container>
    </footer>
  );
}
