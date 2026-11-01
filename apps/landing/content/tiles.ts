// The animated tiles next to the live call demo: what each one says, and the sample data it shows.
import { languageCount } from "@receptionist/product";

export const tiles = {
  booking: { title: "Books into your calendar", description: "Reads the details back, then books. Never twice." },
  transfer: {
    title: "Urgent calls go to a person",
    description: 'Emergencies and "can I speak to someone" go straight to you.',
  },
  summary: {
    title: "A summary of every call",
    description: "Emailed the moment it hangs up, with the full transcript.",
  },
  languages: { title: `${languageCount} languages, switched mid-call` },
  concurrent: { title: "Several calls at once", description: "Nobody waits on hold." },
  spam: { title: "Robocalls blocked", description: "Blocked before the AI answers, so spam never reaches you." },
};

export const bookingSlots = {
  before: { time: "09:00", label: "Boiler service" },
  booked: { time: "10:00", label: "Maria Lopez · sink leak", tag: "New" },
  after: { time: "11:00", label: "Free" },
};

export const summaryEmail = {
  from: "AI Receptionist",
  time: "11:43 pm",
  subject: "New booking: Maria Lopez",
  lines: ["Kitchen sink leak under the cabinet.", "Booked Wed 10:00 · 555-0142 confirmed."],
};

export type Greeting = { text: string; lang: string };

// "Hello" in some of the launch languages, for the two marquees.
export const greetings: { forward: Greeting[]; backward: Greeting[] } = {
  forward: [
    { text: "Hello", lang: "en" },
    { text: "Bonjour", lang: "fr" },
    { text: "مرحبا", lang: "ar" },
    { text: "Hallo", lang: "de" },
    { text: "नमस्ते", lang: "hi" },
    { text: "Hola", lang: "es" },
    { text: "こんにちは", lang: "ja" },
    { text: "Olá", lang: "pt" },
    { text: "Ciao", lang: "it" },
  ],
  backward: [
    { text: "你好", lang: "zh" },
    { text: "안녕하세요", lang: "ko" },
    { text: "Merhaba", lang: "tr" },
    { text: "Привет", lang: "ru" },
    { text: "Xin chào", lang: "vi" },
    { text: "สวัสดี", lang: "th" },
    { text: "שלום", lang: "he" },
    { text: "Cześć", lang: "pl" },
    { text: "Hej", lang: "sv" },
  ],
};

export const incomingCalls = [
  { number: "+1 303 555 0142", state: "Answering" },
  { number: "+1 720 555 0199", state: "Answering" },
  { number: "+1 303 555 0188", state: "Booking" },
  { number: "+1 720 555 0161", state: "Answering" },
];

export const blockedNumber = "+1 888 555 0100";
