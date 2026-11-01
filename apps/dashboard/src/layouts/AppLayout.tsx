import { LogoMark } from "@receptionist/ui/blocks/logo";
import { Separator } from "@receptionist/ui/components/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { NavLink, Outlet, useLocation, useNavigation } from "react-router";
import { AccountMenu } from "./AccountMenu";
import { SampleDataBadge } from "./SampleDataBadge";

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
            <SidebarMenuButton size="lg" render={<NavLink to="/" onClick={() => setOpenMobile(false)} />}>
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
      <SidebarFooter>
        <AccountMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AppLayout() {
  const { pathname } = useLocation();
  const navigation = useNavigation();
  const current = nav.find((item) => isCurrent(item.to, pathname));

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="relative flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ms-1" />
          <Separator orientation="vertical" className="me-2 data-vertical:h-4 data-vertical:self-center" />
          <span className="text-sm font-medium">{current?.label}</span>
          <SampleDataBadge className="ms-auto" />
          {navigation.state === "loading" && (
            <div
              role="progressbar"
              aria-label="Loading page"
              className="absolute inset-x-0 -bottom-px h-0.5 animate-pulse bg-primary"
            />
          )}
        </header>
        {/* SidebarInset is the page's <main>. */}
        <div className="flex-1 p-4 sm:p-8">
          <div className="mx-auto w-full max-w-6xl">
            <Outlet />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
