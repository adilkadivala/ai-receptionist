// MOCK: sample receptionist until the agent routes exist (build step 6). Saves change this module's copy,
// so they last until the page reloads.
import { ago } from "../../lib/mock";
import { mockAgentId, mockOrganizationId } from "../calls/mocks";
import type { Agent, AgentConfig, Voice } from "./types";

export const mockAgents: Agent[] = [
  {
    id: mockAgentId,
    organization_id: mockOrganizationId,
    name: "Front desk",
    created_at: "2026-08-04T15:20:00Z",
    updated_at: ago({ days: 3 }),
  },
];

// Stand-ins for Cartesia voices; the real list comes from the api.
export const mockVoices: Voice[] = [
  { id: "voice_ava", name: "Ava", description: "Warm and unhurried. Good for homes and clinics." },
  { id: "voice_noah", name: "Noah", description: "Calm and clear, with a lower pitch." },
  { id: "voice_mira", name: "Mira", description: "Bright and quick. Suits busy front desks." },
  { id: "voice_leo", name: "Leo", description: "Friendly and steady, a little more formal." },
];

const workday = { open: true, from: "08:00", to: "18:00" };

export const mockConfigs: Record<string, AgentConfig> = {
  [mockAgentId]: {
    id: "cfg_4",
    agent_id: mockAgentId,
    version: 4,
    created_at: ago({ days: 3 }),
    greeting: "Thanks for calling Rivera Plumbing. How can I help?",
    recording_notice: true,
    business_name: "Rivera Plumbing",
    business_info:
      "Family-run plumbers in San Francisco since 1998. We fix leaks, clear drains, install and repair water heaters, and handle burst pipes 24/7. We cover San Francisco, Daly City and northern San Mateo County. Drain clearing starts at $135; call-outs are free with any repair.",
    address: "1180 Harrison Street, San Francisco, CA 94103",
    time_zone: "America/Los_Angeles",
    hours: {
      mon: workday,
      tue: workday,
      wed: workday,
      thu: workday,
      fri: workday,
      sat: { open: true, from: "09:00", to: "14:00" },
      sun: { open: false, from: "09:00", to: "14:00" },
    },
    languages: ["English", "Spanish", "Chinese", "Tagalog"],
    voice_id: "voice_ava",
    transfer_numbers: [
      {
        id: "tr_oncall",
        label: "On-call plumber",
        e164: "+14155550173",
        when: "Burst pipes, flooding, gas smells, no water at all",
      },
      { id: "tr_office", label: "Office", e164: "+14155550110", when: "Existing jobs, invoices, anything else urgent" },
    ],
    faqs: [
      {
        id: "faq_area",
        question: "Which areas do you cover?",
        answer: "San Francisco, Daly City and the rest of northern San Mateo County.",
      },
      {
        id: "faq_callout",
        question: "Do you charge a call-out fee?",
        answer: "Call-outs are free when we do the repair. Otherwise it's $89.",
      },
      {
        id: "faq_licensed",
        question: "Are you licensed and insured?",
        answer: "Yes. California contractor license C-36, fully insured.",
      },
    ],
  },
};
