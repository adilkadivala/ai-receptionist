import { Badge } from "@receptionist/ui/components/badge";
import { SidebarInset, SidebarProvider } from "@receptionist/ui/components/sidebar";
import { cn } from "@receptionist/ui/lib/utils";
import { ShieldCheck } from "lucide-react";
import { type CSSProperties, useState } from "react";
import { Outlet } from "react-router";
import { HeaderSlotProvider } from "../components/header-slot";
import { SiteHeader } from "../components/site-header";
import { resting } from "../components/surfaces";
import { AdminSidebar } from "../features/admin/components/admin-sidebar";

/**
 * The founders' admin area at /admin: the customer dashboard's frame, with its own sidebar and none of the customer's
 * sample data. Only development builds include it (router.tsx), and its api answers only on this computer.
 */
export function AdminLayout() {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <SidebarProvider
      className="bg-sidebar"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as CSSProperties
      }
    >
      <AdminSidebar />
      <SidebarInset className="mt-2 min-w-0 rounded-t-[20px] md:peer-data-[variant=inset]:rounded-[20px] md:peer-data-[variant=inset]:shadow-none">
        <HeaderSlotProvider value={slot}>
          <SiteHeader slotRef={setSlot}>
            <Badge variant="outline" className={cn(resting, "h-6 text-muted-foreground")}>
              <ShieldCheck data-icon="inline-start" />
              <span className="max-sm:sr-only">Admin, read only</span>
            </Badge>
          </SiteHeader>
          <div className="@container/main flex flex-1 flex-col px-4 py-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </HeaderSlotProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
