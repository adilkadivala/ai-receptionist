import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@receptionist/ui/components/sidebar";
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
                className="h-9"
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
                  className="top-2! rounded-full bg-brand-soft px-1.5 text-[11px] font-semibold text-brand-soft-foreground peer-hover/menu-button:text-brand-soft-foreground peer-data-active/menu-button:text-brand-soft-foreground"
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
