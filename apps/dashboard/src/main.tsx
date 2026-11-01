import "./styles.css";
import { Toaster } from "@receptionist/ui/components/sonner";
import { TooltipProvider } from "@receptionist/ui/components/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { useTheme } from "./lib/theme";
import { router } from "./router";

const queryClient = new QueryClient();

/** One toaster for the whole app, following the dashboard's own theme rather than next-themes. */
function AppToaster() {
  const { resolvedTheme } = useTheme();
  return <Toaster theme={resolvedTheme} position="bottom-right" />;
}

const root = document.getElementById("root");
if (!root) throw new Error("index.html is missing #root");

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <AppToaster />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
);
