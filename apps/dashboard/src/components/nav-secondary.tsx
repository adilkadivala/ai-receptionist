import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@receptionist/ui/components/sidebar";
import { Settings2 } from "lucide-react";
import type { ComponentProps } from "react";
import { NavLink, useLocation } from "react-router";
import { HelpSheet } from "./help-sheet";
import { isCurrent } from "./nav-main";

/** Settings and Help, at the foot of the sidebar's navigation. */
export function NavSecondary(props: ComponentProps<typeof SidebarGroup>) {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<NavLink to="/settings" onClick={() => setOpenMobile(false)} />}
              isActive={isCurrent("/settings", pathname)}
            >
              <Settings2 />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <HelpSheet />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
