import { LogoMark } from "@receptionist/ui/blocks/logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@receptionist/ui/components/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@receptionist/ui/components/sidebar";
import { cn } from "@receptionist/ui/lib/utils";
import { ArrowLeft, Building2, LayoutDashboard, type LucideIcon, SunMoon } from "lucide-react";
import type { ComponentProps } from "react";
import { NavLink, useLocation } from "react-router";
import { navItemClassName } from "../../../components/nav-main";
import { SidebarMat, SidebarRuler } from "../../../components/sidebar-mat";
import { glass } from "../../../components/surfaces";
import { setTheme, type ThemeChoice, themeChoices, useTheme } from "../../../lib/theme";

const items: { to: string; label: string; icon: LucideIcon; current: (pathname: string) => boolean }[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, current: (pathname) => /^\/admin\/?$/.test(pathname) },
  {
    to: "/admin/customers",
    label: "Customers",
    icon: Building2,
    current: (pathname) => pathname.startsWith("/admin/customers"),
  },
];

/**
 * The admin area's sidebar, on the same blueprint ink as the customer dashboard's, so it reads as the same product,
 * but headed "Admin" and with a note on who can reach it.
 */
export function AdminSidebar(props: ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();
  const { theme } = useTheme();

  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarMat />
      <SidebarHeader className="relative">
        <div className="flex items-center gap-2 p-2">
          <LogoMark className="shadow-[inset_0_1px_0_color-mix(in_oklch,white_25%,transparent)]" />
          <span className="grid flex-1 text-start leading-tight">
            <span className="truncate font-semibold tracking-[-0.01em]">AI Receptionist</span>
            <span className="truncate text-xs text-sidebar-foreground/60">Admin · every customer</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarRuler />
      <SidebarContent className="relative">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={<NavLink to={item.to} end={item.to === "/admin"} onClick={() => setOpenMobile(false)} />}
                    isActive={item.current(pathname)}
                    className={cn("h-9", navItemClassName)}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<SidebarMenuButton className={cn("data-popup-open:bg-sidebar-accent", navItemClassName)} />}
                  >
                    <SunMoon />
                    <span>Theme</span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" className="min-w-52">
                    <DropdownMenuGroup>
                      <DropdownMenuLabel>Theme</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={theme} onValueChange={(next) => setTheme(next as ThemeChoice)}>
                        {themeChoices.map((choice) => (
                          <DropdownMenuRadioItem key={choice.value} value={choice.value} closeOnClick>
                            {choice.label}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<NavLink to="/" onClick={() => setOpenMobile(false)} />}
                  className={navItemClassName}
                >
                  <ArrowLeft className="rtl:rotate-180" />
                  <span>Customer dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="relative">
        <div className={cn(glass, "flex flex-col gap-1 rounded-[14px] px-3 py-2.5 text-xs leading-relaxed")}>
          <p className="font-medium text-sidebar-foreground">On this computer only</p>
          <p className="text-sidebar-foreground/70">
            There's no admin login yet, so the api shows this to requests made here and nowhere else. Opening a call is
            written to that customer's audit log.
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
