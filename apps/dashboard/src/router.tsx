import { createBrowserRouter } from "react-router";
import { AppLayout } from "./layouts/AppLayout";
import { AgentPage } from "./pages/AgentPage";
import { BillingPage } from "./pages/BillingPage";
import { CallsPage } from "./pages/CallsPage";
import { NumbersPage } from "./pages/NumbersPage";
import { OverviewPage } from "./pages/OverviewPage";
import { SignupPage } from "./pages/SignupPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: "calls", element: <CallsPage /> },
      { path: "agent", element: <AgentPage /> },
      { path: "numbers", element: <NumbersPage /> },
      { path: "billing", element: <BillingPage /> },
    ],
  },
  { path: "/signup", element: <SignupPage /> },
]);
