import { Avatar, AvatarFallback } from "@receptionist/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@receptionist/ui/components/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@receptionist/ui/components/sidebar";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { cn } from "@receptionist/ui/lib/utils";
import { CreditCard, EllipsisVertical, LogOut, Settings2 } from "lucide-react";
import { Link } from "react-router";
import { useAccount } from "../features/account/api";
import { initials } from "../lib/format";
import { type ThemeChoice, themeChoices, useTheme } from "../lib/theme";

/** The signed-in person, with their settings, the theme and log out. */
export function NavUser() {
  const account = useAccount();
  const { theme, setTheme } = useTheme();
  const { isMobile, setOpenMobile } = useSidebar();

  if (!account.data) return <Skeleton className="h-12 rounded-lg bg-sidebar-accent" />;
  const { user } = account.data;
  const avatar = (fallbackClassName?: string) => (
    <Avatar className="size-8">
      <AvatarFallback className={cn("text-xs font-semibold", fallbackClassName)}>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="rounded-lg data-popup-open:bg-sidebar-accent" />}
          >
            {avatar("bg-sidebar-accent text-sidebar-foreground")}
            <span className="grid flex-1 text-start leading-tight">
              <span className="truncate text-[13px] font-medium">{user.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/60">{user.email}</span>
            </span>
            <EllipsisVertical className="ms-auto text-sidebar-foreground/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-2 py-1.5">
                {avatar()}
                <span className="grid leading-tight">
                  <span className="truncate font-medium text-foreground">{user.name}</span>
                  <span className="truncate font-normal">{user.email}</span>
                </span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link to="/settings" onClick={() => setOpenMobile(false)} />}>
                <Settings2 />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem render={<Link to="/billing" onClick={() => setOpenMobile(false)} />}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
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
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/login" />}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
