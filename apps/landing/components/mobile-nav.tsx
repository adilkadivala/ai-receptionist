"use client";

import { Button, buttonVariants } from "@receptionist/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@receptionist/ui/components/sheet";
import { cn } from "@receptionist/ui/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";

type Link = { href: string; label: string };

// Below the md breakpoint the header links move into a side sheet.
export function MobileNav({ links, signupUrl }: { links: Link[]; signupUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>AI Receptionist</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "justify-start")}
            >
              {link.label}
            </a>
          ))}
          <a href={signupUrl} className={cn(buttonVariants({ size: "lg" }), "mt-2")}>
            Get started
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
