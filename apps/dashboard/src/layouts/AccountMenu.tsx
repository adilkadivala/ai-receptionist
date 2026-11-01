import { findPlan } from "@receptionist/product";
import { Avatar, AvatarFallback } from "@receptionist/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@receptionist/ui/components/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@receptionist/ui/components/sidebar";
import { Skeleton } from "@receptionist/ui/components/skeleton";
import { ChevronsUpDown, CreditCard, LogOut } from "lucide-react";
import { Link } from "react-router";
import { useAccount } from "../features/account/api";
import { useSubscription } from "../features/billing/api";

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

/** The business and the signed-in person, at the foot of the sidebar. */
export function AccountMenu() {
  const account = useAccount();
  const subscription = useSubscription();
  const { isMobile, setOpenMobile } = useSidebar();
  const plan = findPlan(subscription.data?.plan);

  if (!account.data) return <Skeleton className="h-12" />;
  const { organization, user } = account.data;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="data-popup-open:bg-sidebar-accent" />}>
            <Avatar className="size-8 rounded-lg">
              <AvatarFallback className="rounded-lg">{initials(organization.name)}</AvatarFallback>
            </Avatar>
            <span className="grid flex-1 text-start leading-tight">
              <span className="truncate font-medium">{organization.name}</span>
              <span className="truncate text-xs text-muted-foreground">{plan ? `${plan.name} plan` : user.email}</span>
            </span>
            <ChevronsUpDown className="ms-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isMobile ? "top" : "right"} align="end" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <span className="block font-medium text-foreground">{user.name}</span>
                <span className="block truncate font-normal">{user.email}</span>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/billing" onClick={() => setOpenMobile(false)} />}>
              <CreditCard />
              Billing
            </DropdownMenuItem>
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
