import type { ReactNode } from "react";
import { NavLink, Outlet } from "react-router";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/calls", label: "Calls" },
  { to: "/agent", label: "Receptionist" },
  { to: "/numbers", label: "Phone numbers" },
  { to: "/billing", label: "Billing" },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 md:flex-row">
      <aside className="shrink-0 border-b border-slate-200 bg-white p-4 md:w-56 md:border-r md:border-b-0">
        <p className="mb-3 px-3 text-lg font-semibold md:mb-6">AI Receptionist</p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `shrink-0 rounded-lg px-3 py-2 text-sm ${isActive ? "bg-brand-50 font-medium text-brand-700" : "text-slate-600 hover:bg-slate-100"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {children && <p className="mt-1 text-slate-600">{children}</p>}
    </header>
  );
}
