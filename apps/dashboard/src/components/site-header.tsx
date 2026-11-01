import { Separator } from "@receptionist/ui/components/separator";
import { SidebarTrigger } from "@receptionist/ui/components/sidebar";
import { useEffect } from "react";
import { useMatches, useNavigation } from "react-router";
import { CallSearch } from "../features/calls/components/call-search";
import { SampleDataBadge } from "../layouts/SampleDataBadge";
import { FrameRule } from "./frame-rule";

export type RouteHandle = { title: string };

/** The page's title from its route, so the header and the browser tab agree. */
export function usePageTitle() {
  const matches = useMatches();
  const handle = matches.findLast((match) => (match.handle as RouteHandle | undefined)?.title)?.handle as
    | RouteHandle
    | undefined;
  const title = handle?.title ?? "Page not found";

  useEffect(() => {
    document.title = `${title} · AI Receptionist`;
  }, [title]);

  return title;
}

/**
 * dashboard-01's header: sidebar toggle and the page's title, then search and the page's own controls, which pages
 * put into `slotRef` with HeaderActions. A dashed guide line runs under it, as on the landing page.
 */
export function SiteHeader({ slotRef }: { slotRef: (element: HTMLDivElement | null) => void }) {
  const title = usePageTitle();
  const navigation = useNavigation();

  return (
    <header className="relative flex h-(--header-height) shrink-0 items-center gap-2 px-4 lg:px-5">
      <SidebarTrigger className="-ms-1.5" />
      <Separator orientation="vertical" className="me-1 data-vertical:h-4 data-vertical:self-center" />
      <h1 className="min-w-0 flex-1 truncate text-[15px] font-semibold tracking-[-0.01em]">{title}</h1>
      <SampleDataBadge />
      <CallSearch />
      <div ref={slotRef} className="contents" />
      <FrameRule />
      {navigation.state === "loading" && (
        <div
          role="progressbar"
          aria-label="Loading page"
          className="absolute inset-x-0 -bottom-px h-0.5 animate-pulse bg-primary"
        />
      )}
    </header>
  );
}
