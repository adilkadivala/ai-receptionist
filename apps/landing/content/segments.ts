// Who it's for: the five customer types in the README, and how each one buys.

export const segments = [
  {
    id: "small-business",
    name: "Small businesses",
    examples: "Plumbers, cleaners, salons, shops, auto repair",
    does: "Answers questions, takes messages, books jobs and emails you a summary of every call.",
    buys: "Monthly plan",
  },
  {
    id: "business-people",
    name: "Business people",
    examples: "Founders, executives, consultants, agents, lawyers",
    does: "Screens calls, books meetings into your calendar and can answer in your own voice.",
    buys: "Monthly plan",
  },
  {
    id: "hotels",
    name: "Busy hotels",
    examples: "Independent hotels and chains",
    does: "Answers guests 24/7 in their own language about rooms, bookings, check-in times and directions, and transfers to the front desk.",
    buys: "Contract",
  },
  {
    id: "hospitals",
    name: "Hospitals and clinics",
    examples: "Appointments, departments, refills",
    does: "Books, moves and cancels appointments, routes calls to departments and takes refill messages. It never gives medical advice.",
    buys: "Contract",
  },
  {
    id: "companies",
    name: "Mid-size and large companies",
    examples: "Chains, multi-branch firms, call centers",
    does: "Routes calls to the right branch or department and covers after hours and overflow.",
    buys: "Contract",
  },
] as const;

export type SegmentId = (typeof segments)[number]["id"];
