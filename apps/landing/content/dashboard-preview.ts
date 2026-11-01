// The dashboard preview on the hero's blue band: an overview page with sample data.
import { findPlan } from "@receptionist/product";
import type { Outcome } from "./demo-calls";

const pro = findPlan("pro");
if (!pro) throw new Error("The Pro plan is missing from @receptionist/product");

export const dashboardPreview = {
  business: "Rivera Plumbing",
  page: "Overview",
  tabs: ["Calls", "Overview", "Receptionist", "Phone numbers", "Billing"],
  status: "Answering calls",
  stats: [
    { label: "Calls answered", value: "128" },
    { label: "Bookings made", value: "86" },
    { label: "Sent to you", value: "31" },
    { label: "Minutes used", value: "212", of: String(pro.minutes) },
  ],
  calls: [
    {
      caller: "Maria Lopez",
      need: "Kitchen sink leak · booked Wed 10:00",
      language: "English",
      outcome: "booked",
      time: "11:42 pm",
    },
    {
      caller: "Unknown caller",
      need: "Burst pipe, water in the basement",
      language: "English",
      outcome: "transferred",
      time: "8:51 pm",
    },
    {
      caller: "Priya Shah",
      need: "Wants a quote for a bathroom refit",
      language: "Hinglish",
      outcome: "message",
      time: "6:20 pm",
    },
  ] satisfies { caller: string; need: string; language: string; outcome: Outcome; time: string }[],
};
