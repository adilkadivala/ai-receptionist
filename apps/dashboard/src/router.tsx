import { createBrowserRouter, type RouteObject } from "react-router";
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
  // The founders' admin area: every customer's data in one place. Only development builds include it, and its api
  // answers only on this computer, until there's an admin login (docs/development.md).
  ...(import.meta.env.DEV ? [adminRoutes()] : []),
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

function adminRoutes(): RouteObject {
  return {
    path: "/admin",
    lazy: () => import("./layouts/AdminLayout").then((m) => ({ Component: m.AdminLayout })),
    errorElement: <RouteErrorPage />,
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        handle: title("Overview"),
        lazy: () => import("./pages/admin/AdminOverviewPage").then((m) => ({ Component: m.AdminOverviewPage })),
      },
      {
        path: "customers",
        handle: title("Customers"),
        lazy: () => import("./pages/admin/AdminCustomersPage").then((m) => ({ Component: m.AdminCustomersPage })),
      },
      {
        path: "customers/:id",
        handle: title("Customer"),
        lazy: () => import("./pages/admin/AdminCustomerPage").then((m) => ({ Component: m.AdminCustomerPage })),
        // A call opens in a sheet over the customer, so /admin/customers/:id/calls/:callId renders the customer too.
        children: [{ path: "calls/:callId" }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  };
}
