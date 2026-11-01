"use client";

import { Button, buttonVariants } from "@receptionist/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@receptionist/ui/components/sheet";
import { cn } from "@receptionist/ui/lib/utils";
import { Menu } from "lucide-react";
import { useState } from "react";
import type { NavLink } from "@/lib/site";

// Below the lg breakpoint the header links move into a side sheet.
export function MobileNav({ links, signupUrl }: { links: NavLink[]; signupUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label="Open menu" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>AI Receptionist</SheetTitle>
        </SheetHeader>
        <nav aria-label="Main" className="flex flex-col gap-1 px-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "h-11 justify-start text-base")}
            >
              {link.label}
            </a>
          ))}
          <a href={signupUrl} className={cn(buttonVariants({ size: "lg" }), "mt-2 h-11 text-base")}>
            Get started
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
