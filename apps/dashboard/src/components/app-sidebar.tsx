import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from "@receptionist/ui/components/sidebar";
import type { ComponentProps } from "react";
import { SidebarUsage } from "../features/billing/components/sidebar-usage";
import { TestCallDialog } from "../features/numbers/components/test-call-dialog";
import { BusinessSwitcher } from "./business-switcher";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { SidebarMat, SidebarRuler } from "./sidebar-mat";

/**
 * dashboard-01's inset sidebar, drawn on blueprint ink: the business, a test call, a ruler, the pages, then help,
 * minutes and the user.
 */
export function AppSidebar(props: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" variant="inset" {...props}>
      <SidebarMat />
      <SidebarHeader className="relative gap-3">
        <BusinessSwitcher />
        <SidebarMenu>
          <SidebarMenuItem>
            <TestCallDialog />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarRuler />
      <SidebarContent className="relative">
        <NavMain />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="relative gap-3">
        <SidebarUsage />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
