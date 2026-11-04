// The animated tiles next to the live call demo: what each one says, and the sample data it shows.
import { languageCount } from "@receptionist/product";
import type { Outcome } from "./demo-calls";

export const tiles = {
  // `soon`: not built yet, so the tile says "Coming soon" (components/soon.tsx).
  booking: {
    title: "Books into your calendar",
    description: "Reads the details back, then books. Never twice.",
    soon: true,
  },
  transfer: {
    title: "Urgent calls go to a person",
    description: "Emergencies are put through to you. Everything else, it handles itself.",
  },
  summary: {
    title: "A summary of every call",
    description: "By email and WhatsApp the moment it hangs up, with the full transcript.",
  },
  languages: {
    title: `${languageCount} languages, switched mid-call`,
    description: "It answers in the caller's language, and follows when they switch.",
  },
  concurrent: { title: "Several calls at once", description: "Nobody waits on hold." },
  spam: {
    title: "Robocalls blocked",
    description: "Blocked before the AI answers, so spam never reaches you.",
    soon: true,
  },
};

// One day's calendar filling up, a booking at a time.
export const bookingDay = {
  day: "Wed",
  bookings: [
    { time: "09:00", name: "Sam Ortiz", need: "Boiler service" },
    { time: "10:00", name: "Maria Lopez", need: "Sink leak" },
    { time: "11:30", name: "Grace Kim", need: "Water heater" },
    { time: "14:00", name: "Priya Shah", need: "Tap repair" },
  ],
};

// Calls reaching the receptionist: urgent ones go to a person, the rest it handles itself.
export const routedCalls = [
  { reason: "Book a boiler service", urgent: false },
  { reason: "Burst pipe, water everywhere", urgent: true },
  { reason: "Are you open Saturday?", urgent: false },
  { reason: "Sewage coming up the drain", urgent: true },
  { reason: "Can I speak to someone?", urgent: false },
  { reason: "Price for a new tap", urgent: false },
];

export type SummaryEmail = { time: string; subject: string; lines: string[]; outcome: Outcome };

export const summaryEmails: SummaryEmail[] = [
  {
    time: "11:43 pm",
    subject: "Booking request: Maria Lopez",
    lines: ["Kitchen sink leak under the cabinet.", "Wants Wed morning · 555-0142 confirmed."],
    outcome: "message",
  },
  {
    time: "2:07 pm",
    subject: "Message from Grace Kim",
    lines: ["Water heater is making a knocking noise.", "Call back after 5 pm · 555-0126."],
    outcome: "message",
  },
  {
    time: "8:51 pm",
    subject: "Urgent call: Liam O'Connor",
    lines: ["Burst pipe in the basement, water rising.", "Put through to you straight away."],
    outcome: "transferred",
  },
];

export type Greeting = { text: string; lang: string };

// Every language it speaks, twice: "hello" going one way, and how people answer the phone going the other.
export const greetings: { forward: Greeting[]; backward: Greeting[] } = {
  forward: [
    { text: "Hello", lang: "en" },
    { text: "Bonjour", lang: "fr" },
    { text: "नमस्ते", lang: "hi" },
    { text: "Hallo", lang: "de" },
    { text: "Hola", lang: "es" },
    { text: "こんにちは", lang: "ja" },
    { text: "Olá", lang: "pt" },
    { text: "Привет", lang: "ru" },
    { text: "Ciao", lang: "it" },
    { text: "Hoi", lang: "nl" },
  ],
  backward: [
    { text: "Allô", lang: "fr" },
    { text: "もしもし", lang: "ja" },
    { text: "¿Dígame?", lang: "es" },
    { text: "Pronto", lang: "it" },
    { text: "Haan ji, boliye", lang: "hi-Latn" },
    { text: "Алло", lang: "ru" },
    { text: "Alô", lang: "pt" },
    { text: "Guten Tag", lang: "de" },
    { text: "Goedendag", lang: "nl" },
    { text: "Hi there", lang: "en" },
  ],
};

// Calls arriving while others are still going; each one is answered at once.
export const incomingCalls = [
  { number: "+1 303 555 0142", state: "Booking" },
  { number: "+1 720 555 0199", state: "Answering" },
  { number: "+1 303 555 0188", state: "Taking a message" },
  { number: "+1 720 555 0161", state: "Answering" },
  { number: "+1 415 555 0117", state: "Booking" },
  { number: "+1 628 555 0173", state: "Answering" },
];

// Two real callers get through; the robocall is stopped before the AI picks up.
export const screenedCalls = [
  { number: "+1 415 555 0142", spam: false },
  { number: "+1 628 555 0119", spam: false },
  { number: "+1 888 555 0100", spam: true },
];
