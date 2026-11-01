import { SidebarInset, SidebarProvider } from "@receptionist/ui/components/sidebar";
import { type CSSProperties, useState } from "react";
import { Outlet } from "react-router";
import { AppSidebar } from "../components/app-sidebar";
import { HeaderSlotProvider } from "../components/header-slot";
import { SiteHeader } from "../components/site-header";

/**
 * shadcn's dashboard-01 frame, drawn like the landing page: the sidebar on blueprint ink, and beside it the page as a
 * light sheet lying on the same ink, holding the header and the page. On phones the sheet fills the screen below a
 * strip of ink.
 */
export function AppLayout() {
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);

  return (
    <SidebarProvider
      // The ink behind the sheet. shadcn only paints it while the desktop sidebar is mounted, so phones set it here.
      className="bg-sidebar"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 68)",
          "--header-height": "calc(var(--spacing) * 14)",
        } as CSSProperties
      }
    >
      <AppSidebar />
      {/* SidebarInset is the page's <main>. */}
      <SidebarInset className="mt-2 min-w-0 rounded-t-[20px] md:peer-data-[variant=inset]:rounded-[20px] md:peer-data-[variant=inset]:shadow-none">
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
