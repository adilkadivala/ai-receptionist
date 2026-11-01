import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@receptionist/ui/components/sidebar";
import { cn } from "@receptionist/ui/lib/utils";
import { Bot, CreditCard, Hash, LayoutDashboard, type LucideIcon, PhoneIncoming } from "lucide-react";
import { NavLink, useLocation } from "react-router";
import { useCallsToday } from "../features/calls/api";

const items: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/calls", label: "Calls", icon: PhoneIncoming },
  { to: "/agent", label: "Receptionist", icon: Bot },
  { to: "/numbers", label: "Phone numbers", icon: Hash },
  { to: "/billing", label: "Billing", icon: CreditCard },
];

export function isCurrent(to: string, pathname: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

// On the blueprint, pages are white at 75%; the current one is full white on clear glass with its own hairline.
export const navItemClassName = "text-sidebar-foreground/75 data-active:inset-ring data-active:inset-ring-(--ink-line)";

/** The dashboard's pages. Calls carries today's messages, the calls most likely to need a callback. */
export function NavMain() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();
  const messages = useCallsToday().data?.messages ?? 0;

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton
                render={<NavLink to={item.to} end={item.to === "/"} onClick={() => setOpenMobile(false)} />}
                isActive={isCurrent(item.to, pathname)}
                className={cn("h-9", navItemClassName)}
              >
                <item.icon />
                <span>
                  {item.label}
                  {item.to === "/calls" && messages > 0 && (
                    <span className="sr-only">
                      , {messages} {messages === 1 ? "message" : "messages"} today
                    </span>
                  )}
                </span>
              </SidebarMenuButton>
              {item.to === "/calls" && messages > 0 && (
                <SidebarMenuBadge
                  aria-hidden
                  className="top-2! rounded-full bg-primary-foreground px-1.5 font-mono text-[11px] font-medium text-(color:--ink) peer-hover/menu-button:text-(color:--ink) peer-data-active/menu-button:text-(color:--ink)"
                >
                  {messages}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
