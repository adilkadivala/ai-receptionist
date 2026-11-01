import { LogoMark } from "@receptionist/ui/blocks/logo";
import { Separator } from "@receptionist/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@receptionist/ui/components/sidebar";
import { Bot, CreditCard, LayoutDashboard, type LucideIcon, Phone, PhoneIncoming } from "lucide-react";
import type { ReactNode } from "react";
import { NavLink, Outlet, useLocation } from "react-router";

const nav: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/calls", label: "Calls", icon: PhoneIncoming },
  { to: "/agent", label: "Receptionist", icon: Bot },
  { to: "/numbers", label: "Phone numbers", icon: Phone },
  { to: "/billing", label: "Billing", icon: CreditCard },
];

function isCurrent(to: string, pathname: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

function AppSidebar() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<NavLink to="/" />}>
              <LogoMark className="bg-sidebar-primary text-sidebar-primary-foreground" />
              <span className="font-heading font-semibold">AI Receptionist</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={<NavLink to={item.to} end={item.to === "/"} onClick={() => setOpenMobile(false)} />}
                    isActive={isCurrent(item.to, pathname)}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const current = nav.find((item) => isCurrent(item.to, pathname));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-center" />
          <span className="text-sm font-medium">{current?.label}</span>
        </header>
        <div className="flex-1 p-4 sm:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="font-heading text-2xl font-semibold tracking-tight">{title}</h1>
      {children && <p className="mt-1 text-muted-foreground">{children}</p>}
    </header>
  );
}
