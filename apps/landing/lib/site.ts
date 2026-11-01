// Where the site lives and where it links to. NEXT_PUBLIC_* values are inlined at build time.

export const siteName = "AI Receptionist";

// The landing page's own address, for canonical links, Open Graph, the sitemap and robots.txt.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

// The share card, rendered at build time by app/og.png/route.tsx.
export const ogImage = { url: "/og.png", width: 1200, height: 630 };

// In production this is the dashboard's own domain, e.g. https://app.example.com.
export const dashboardUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:5173";

export function signupUrl(plan?: string): string {
  return plan ? `${dashboardUrl}/signup?plan=${plan}` : `${dashboardUrl}/signup`;
}

export const loginUrl = `${dashboardUrl}/login`;

// Placeholder until the sales inbox exists.
export const salesEmail = "sales@example.com";
export const contactHref = `mailto:${salesEmail}`;

export type NavLink = { href: string; label: string };

// Absolute paths, so the links also work from /privacy and /terms.
export const sectionLinks: NavLink[] = [
  { href: "/#product", label: "Product" },
  { href: "/#how", label: "How it works" },
  { href: "/#languages", label: "Languages" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export const legalLinks: NavLink[] = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const footerLinks: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Features" },
      { href: "/#pricing", label: "Pricing" },
      { href: "/#languages", label: "Languages" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#faq", label: "FAQ" },
      { href: contactHref, label: "Contact" },
    ],
  },
  { title: "Legal", links: legalLinks },
];
