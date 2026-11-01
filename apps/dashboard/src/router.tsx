import { createBrowserRouter } from "react-router";
import { PageLoader } from "./components/page-loader";
import type { RouteHandle } from "./components/site-header";
import { AppLayout } from "./layouts/AppLayout";
import { NotFoundPage } from "./pages/NotFoundPage";
import { RouteErrorPage } from "./pages/RouteErrorPage";

const title = (text: string): RouteHandle => ({ title: text });

// Each page is its own chunk, loaded on first visit. The layout and the error pages stay in the main bundle, so the
// sidebar shows at once and errors can always render. `handle.title` is the header's title and the browser tab's.
export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        handle: title("Overview"),
        lazy: () => import("./pages/OverviewPage").then((m) => ({ Component: m.OverviewPage })),
      },
      {
        path: "calls",
        handle: title("Calls"),
        lazy: () => import("./pages/CallsPage").then((m) => ({ Component: m.CallsPage })),
        // The call detail opens in a sheet over the list, so /calls/:id renders the list too.
        children: [{ path: ":id" }],
      },
      {
        path: "agent",
        handle: title("Receptionist"),
        lazy: () => import("./pages/ReceptionistPage").then((m) => ({ Component: m.ReceptionistPage })),
      },
      {
        path: "numbers",
        handle: title("Phone numbers"),
        lazy: () => import("./pages/NumbersPage").then((m) => ({ Component: m.NumbersPage })),
      },
      {
        path: "billing",
        handle: title("Billing"),
        lazy: () => import("./pages/BillingPage").then((m) => ({ Component: m.BillingPage })),
      },
      {
        path: "settings",
        handle: title("Settings"),
        lazy: () => import("./pages/SettingsPage").then((m) => ({ Component: m.SettingsPage })),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  {
    path: "/signup",
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: () => import("./pages/SignupPage").then((m) => ({ Component: m.SignupPage })),
  },
  {
    path: "/login",
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    lazy: () => import("./pages/LoginPage").then((m) => ({ Component: m.LoginPage })),
  },
]);
