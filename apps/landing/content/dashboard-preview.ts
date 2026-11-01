// The dashboard preview in the hero: five pages of the dashboard with sample data, one per tab.
import { addOns, findPlan, overagePerMinute } from "@receptionist/product";
import type { Outcome } from "./demo-calls";

const pro = findPlan("pro");
const extraNumber = addOns.find((addOn) => addOn.id === "extra-number");
if (!pro || !extraNumber)
  throw new Error("The Pro plan or the extra-number add-on is missing from @receptionist/product");

export const previewPages = ["Calls", "Overview", "Receptionist", "Phone numbers", "Billing"] as const;
export type PreviewPage = (typeof previewPages)[number];

type Call = { caller: string; need: string; language: string; outcome: Outcome; time: string };

const calls = [
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
  {
    caller: "Sam Ortiz",
    need: "Boiler service · booked Thu 9:00",
    language: "Spanish",
    outcome: "booked",
    time: "4:05 pm",
  },
  { caller: "+1 (555) 019-0199", need: "Recorded sales call", language: "English", outcome: "spam", time: "2:31 pm" },
] satisfies Call[];

// The page the preview opens on.
const firstPage: PreviewPage = "Overview";

// Last month went 12 minutes over the plan.
const lastMonthOverage = 12 * overagePerMinute;
const monthly = pro.price + extraNumber.price;

export const dashboardPreview = {
  business: "Rivera Plumbing",
  firstPage,
  status: "Answering calls",
  overview: {
    stats: [
      { label: "Calls answered", value: 128 },
      { label: "Bookings made", value: 86 },
      { label: "Sent to you", value: 31 },
      { label: "Minutes used", value: 212, of: pro.minutes },
    ],
    calls: calls.slice(0, 3),
  },
  calls: {
    search: "Search callers, numbers or what they needed",
    filters: ["All", "Booked", "Transferred", "Message taken", "Spam"],
    log: calls,
  },
  receptionist: {
    greeting: "Thanks for calling Rivera Plumbing. I'm the AI receptionist. How can I help?",
    voice: "Warm and calm, answers in the caller's language",
    hours: [
      { days: "Mon – Fri", time: "8:00 – 18:00" },
      { days: "Saturday", time: "9:00 – 13:00" },
      { days: "Sunday", time: "Closed" },
    ],
    transfers: [
      { when: "Burst pipes, no heat, gas smell", to: "Luis Rivera" },
      { when: "Asks for a person", to: "Office line" },
    ],
    questions: 18,
  },
  numbers: [
    { number: "+1 (555) 014-2290", label: "Main line", detail: "Your business number forwards here", calls: 112 },
    { number: "+1 (555) 014-7781", label: "After hours", detail: extraNumber.name, calls: 16 },
  ],
  billing: {
    plan: pro,
    addOn: extraNumber,
    minutesUsed: 212,
    renews: "Dec 1",
    invoices: [
      { date: "Nov 1", amount: monthly, note: "Plan and add-on" },
      { date: "Oct 1", amount: monthly + lastMonthOverage, note: "12 extra minutes" },
      { date: "Sep 1", amount: monthly, note: "Plan and add-on" },
    ],
  },
};
