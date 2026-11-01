import { findPlan } from "@receptionist/product";
import { LogoMark } from "@receptionist/ui/blocks/logo";
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
import { ChevronsUpDown, CreditCard } from "lucide-react";
import { Link } from "react-router";
import { useAccount } from "../features/account/api";
import { useSubscription } from "../features/billing/api";

/** The business this dashboard belongs to and its plan, at the top of the sidebar. */
export function BusinessSwitcher() {
  const account = useAccount();
  const plan = findPlan(useSubscription().data?.plan);
  const { isMobile, setOpenMobile } = useSidebar();

  if (!account.data) return <Skeleton className="h-12 rounded-lg bg-sidebar-accent" />;
  const { organization } = account.data;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" className="rounded-lg data-popup-open:bg-sidebar-accent" />}
          >
            <LogoMark className="shadow-[inset_0_1px_0_color-mix(in_oklch,white_25%,transparent)]" />
            <span className="grid flex-1 text-start leading-tight">
              <span className="truncate font-semibold tracking-[-0.01em]">{organization.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/60">{plan ? `${plan.name} plan` : " "}</span>
            </span>
            <ChevronsUpDown className="ms-auto text-sidebar-foreground/60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side={isMobile ? "bottom" : "right"} className="min-w-60">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Business</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={organization.id}>
                <DropdownMenuRadioItem value={organization.id}>{organization.name}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link to="/billing" onClick={() => setOpenMobile(false)} />}>
              <CreditCard />
              Plan and billing
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
