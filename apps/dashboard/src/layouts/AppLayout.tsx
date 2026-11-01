import { SidebarInset, SidebarProvider } from "@receptionist/ui/components/sidebar";
import { type CSSProperties, useState } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "../components/app-sidebar";
import { HeaderSlotProvider } from "../components/header-slot";
import { SiteHeader } from "../components/site-header";

/** shadcn's dashboard-01 frame: an inset sidebar beside one white panel holding the header and the page. */
export function AppLayout() {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as CSSProperties
      }
    >
      <AppSidebar />
      {/* SidebarInset is the page's <main>. */}
      <SidebarInset className="min-w-0 bg-card md:peer-data-[variant=inset]:rounded-2xl md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:shadow-xs">
        <HeaderSlotProvider value={slot}>
          <SiteHeader slotRef={setSlot} />
          <div className="@container/main flex flex-1 flex-col px-4 py-5 lg:px-6 lg:py-6">
            <Outlet />
          </div>
        </HeaderSlotProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
