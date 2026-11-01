import { LogoMark } from "@receptionist/ui/blocks/logo";
import { cn } from "@receptionist/ui/lib/utils";
import { footer } from "@/content/home";
import { footerLinks, siteName } from "@/lib/site";
import { eyebrowClassName, gutter } from "./section";

export function SiteFooter() {
  return (
    <footer className={cn("flex flex-col gap-10 border-t border-dashed border-frame pt-12 pb-8", gutter)}>
      <div className="flex flex-wrap justify-between gap-8">
        <div className="flex max-w-[300px] flex-col gap-3">
          <a href="/" className="inline-flex items-center gap-2.5 self-start rounded-lg font-semibold">
            <LogoMark className="size-6.5 rounded-[7px] [&_svg]:size-3.5" />
            {siteName}
          </a>
          <p className="text-sm/relaxed text-muted-foreground">{footer.tagline}</p>
        </div>
        <div className="flex flex-wrap gap-x-14 gap-y-8">
          {footerLinks.map((group) => (
            <nav key={group.title} aria-label={group.title} className="flex flex-col gap-2.5 text-sm">
              <h2 className={cn(eyebrowClassName, "text-[11px]")}>{group.title}</h2>
              {group.links.map((link) => (
                <a key={link.href} href={link.href} className="self-start transition-colors hover:text-primary">
                  {link.label}
                </a>
              ))}
            </nav>
          ))}
        </div>
      </div>
      <p className="border-t pt-5 text-[13px] text-muted-foreground">
        © {new Date().getFullYear()} {siteName} · {footer.note}
      </p>
    </footer>
  );
}
