import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Receptionist: every call answered, in 42 languages",
  description:
    "An AI receptionist that answers your phone 24/7, books appointments, takes messages and transfers urgent calls, for businesses of every size.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white font-sans text-slate-900 antialiased">{children}</body>
    </html>
  );
}
