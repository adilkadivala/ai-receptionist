// MOCK: sample calls until GET /api/calls exists (build step 6). Generated from a fixed seed, so ids and transcripts
// stay the same between reloads; times are relative to today, so the list always looks current.
import type { Language } from "@receptionist/product";
import { aiNotice } from "../receptionist/greeting";
import type { Call, CallOutcome, TranscriptTurn } from "./types";

export const mockOrganizationId = "org_rivera";
export const mockAgentId = "agt_front_desk";
export const mockMainNumber = { id: "num_main", e164: "+14155550142" };

// Roughly the README's ~$0.031 per call minute, so sample costs look like real ones.
const sampleCostPerMinute = 0.031;

const greeting = `Thanks for calling Rivera Plumbing. How can I help? ${aiNotice(true)}`;

type Scenario = {
  outcome: CallOutcome;
  language: Language | null;
  weight: number;
  seconds: [number, number];
  names: readonly (string | null)[];
  summary: string;
  /** `{name}` and `{first}` are replaced with the caller's name, `{native}` with it in the caller's script. */
  turns: readonly [role: TranscriptTurn["role"], text: string, language?: Language][];
};

const scenarios: Scenario[] = [
  {
    outcome: "booking",
    language: "English",
    weight: 5,
    seconds: [150, 320],
    names: ["James Carter", "Priya Shah", "Grace Kim", "Daniel Brooks", "Hannah Weiss"],
    summary:
      "{name}'s water heater stopped giving hot water this morning. Booked a technician for Thursday, 10–12, at 2140 Lombard Street.",
    turns: [
      ["ai", greeting],
      ["caller", "Hi, my water heater stopped giving hot water this morning."],
      ["ai", "Sorry to hear that. I can book a technician to take a look. What's the address?"],
      ["caller", "2140 Lombard Street. It's {name}."],
      ["ai", "Thanks, {first}. The earliest slot is Thursday between 10 and 12. Would that work?"],
      ["caller", "Yes, that's fine."],
      ["ai", "You're booked for Thursday, 10 to 12. You'll get a text to confirm. Anything else?"],
      ["caller", "No, that's all. Thanks!"],
    ],
  },
  {
    outcome: "transfer",
    language: "English",
    weight: 3,
    seconds: [50, 140],
    names: ["Tom Nguyen", "Aisha Bello", "Liam O'Connor"],
    summary:
      "{name} reported a burst pipe under the kitchen sink. Told them how to shut off the main valve and transferred them to the on-call plumber.",
    turns: [
      ["ai", greeting],
      ["caller", "This is {name}. A pipe burst under my kitchen sink and there's water everywhere!"],
      [
        "ai",
        "That's urgent. If you can, turn off the water at the main shut-off valve. I'm connecting you to our on-call plumber now.",
      ],
      ["caller", "Okay, I found the valve. Thank you."],
      ["ai", "Transferring you now. Please stay on the line."],
    ],
  },
  {
    outcome: "answered",
    language: "English",
    weight: 4,
    seconds: [35, 100],
    names: [null],
    summary: "Asked about Saturday hours and whether we cover Daly City. Answered both; they'll call back to book.",
    turns: [
      ["ai", greeting],
      ["caller", "Hi, are you open on Saturdays?"],
      ["ai", "Yes, Saturdays from 9 to 2. On Sundays we only take emergency calls. Anything else?"],
      ["caller", "Do you cover Daly City?"],
      ["ai", "We do: all of San Francisco, Daly City and the rest of northern San Mateo County."],
      ["caller", "Great, I'll call back to book. Thanks."],
    ],
  },
  {
    outcome: "message",
    language: "English",
    weight: 3,
    seconds: [80, 190],
    names: ["Ben Adler", "Sofia Rossi", "Marcus Lee"],
    summary: "{name} from Bayside Supply wants Ana to call back about invoice 4471.",
    turns: [
      ["ai", greeting],
      ["caller", "Hi, it's {name} from Bayside Supply. I need to talk to the owner about last month's invoice."],
      ["ai", "Ana isn't available right now. I'll take a message and make sure she gets it today. Best number?"],
      ["caller", "This number is fine. Tell her it's about invoice 4471."],
      ["ai", "Got it: {first} from Bayside Supply, about invoice 4471, call back on this number."],
      ["caller", "That's it, thanks."],
    ],
  },
  {
    outcome: "spam",
    language: null,
    weight: 3,
    seconds: [3, 12],
    names: [null],
    summary: "Blocked as a robocall before the receptionist answered.",
    turns: [],
  },
  {
    outcome: "booking",
    language: "Spanish",
    weight: 2,
    seconds: [150, 280],
    names: ["Lucía Herrera", "Carlos Méndez", "Ana Torres"],
    summary: "{name} has a leaking kitchen faucet. Booked Friday, 8–10 am. The call was in Spanish.",
    turns: [
      ["ai", greeting, "English"],
      ["caller", "Hola, ¿hablan español?"],
      ["ai", "Sí, claro. ¿En qué le puedo ayudar?"],
      ["caller", "Tengo una fuga en el grifo de la cocina. Me llamo {name}."],
      [
        "ai",
        "Gracias, {first}. Puedo enviar un técnico el viernes entre las 8 y las 10 de la mañana. ¿Le parece bien?",
      ],
      ["caller", "Sí, perfecto."],
      ["ai", "Listo. Le enviaremos un mensaje de texto con la confirmación."],
    ],
  },
  {
    outcome: "abandoned",
    language: null,
    weight: 2,
    seconds: [4, 14],
    names: [null],
    summary: "The caller hung up during the greeting.",
    turns: [["ai", greeting]],
  },
  {
    outcome: "answered",
    language: "Hindi",
    weight: 1,
    seconds: [60, 120],
    names: [null],
    summary:
      "Asked whether we clear blocked drains and what it costs. Quoted from $135; they didn't book. The call was in Hindi.",
    turns: [
      ["ai", greeting, "English"],
      ["caller", "नमस्ते, क्या आप बंद नाली साफ़ करते हैं? इसका कितना खर्च आएगा?"],
      ["ai", "नमस्ते! हाँ, हम नाली साफ़ करते हैं। इसका खर्च $135 से शुरू होता है। क्या मैं आपके लिए समय बुक कर दूँ?"],
      ["caller", "अभी नहीं, धन्यवाद।"],
      ["ai", "कोई बात नहीं। जब चाहें दोबारा फ़ोन करें।"],
    ],
  },
  {
    outcome: "message",
    language: "Arabic",
    weight: 1,
    seconds: [80, 160],
    // "Latin|Arabic": the summary uses the first, the transcript the second.
    names: ["Layla Haddad|ليلى حداد", "Omar Khalil|عمر خليل", "Nour Saleh|نور صالح"],
    summary:
      "{name} wants a quote for a bathroom remodel. Took a message and promised a call back within one working day. The call was in Arabic.",
    turns: [
      ["ai", greeting, "English"],
      ["caller", "مرحباً، أريد عرض سعر لتجديد الحمام."],
      ["ai", "أهلاً بك! سأترك رسالة لفريقنا ليتصل بك بعرض سعر. ما اسمك؟"],
      ["caller", "اسمي {native}، ويمكنكم الاتصال بي على هذا الرقم."],
      ["ai", "شكراً لك. سيتصل بك أحد من فريقنا خلال يوم عمل واحد."],
    ],
  },
  {
    outcome: "failed",
    language: "English",
    weight: 1,
    seconds: [20, 50],
    names: [null],
    summary: "The call dropped after a voice service error, before the caller said what they needed.",
    turns: [
      ["ai", greeting],
      ["caller", "Hi, I'm calling about the"],
    ],
  },
  {
    outcome: "transfer",
    language: "English",
    weight: 2,
    seconds: [45, 110],
    names: ["Rachel Green", "Omar Farouk", "Ethan Park"],
    summary: "{name} wanted to add a second job while the technician was on site. Transferred to the office.",
    turns: [
      ["ai", greeting],
      ["caller", "Hi, it's {name}. Your technician is here and I'd like to add a second job."],
      ["ai", "Of course, {first}. I'll put you through to the office now."],
    ],
  },
];

// mulberry32: a tiny seeded random generator, so the sample data is the same on every load.
function seeded(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateCalls(days: number): Call[] {
  const random = seeded(42);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(random() * items.length)] as T;
  const between = (min: number, max: number) => Math.round(min + random() * (max - min));
  const totalWeight = scenarios.reduce((sum, scenario) => sum + scenario.weight, 0);
  const pickScenario = () => {
    let roll = random() * totalWeight;
    for (const scenario of scenarios) {
      roll -= scenario.weight;
      if (roll < 0) return scenario;
    }
    return scenarios[0] as Scenario;
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calls: Call[] = [];

  for (let day = 0; day < days; day++) {
    // Quieter at weekends, and a little busier lately as more callers find the number.
    const weekday = new Date(today.getTime() - day * 86_400_000).getDay();
    const weekend = weekday === 0 || weekday === 6;
    const perDay = weekend ? between(1, 3) : between(2, 5) + (day < 45 ? 1 : 0);
    for (let n = 0; n < perDay; n++) {
      const scenario = pickScenario();
      const [name = null, native = name] = pick(scenario.names)?.split("|") ?? [];
      const first = name?.split(" ")[0] ?? "";
      const seconds = between(...scenario.seconds);
      // Mostly working hours, with some evenings and nights: the calls nobody else would have answered.
      const hour = random() < 0.8 ? between(7, 18) : between(19, 23);
      const started = new Date(today.getTime() - day * 86_400_000 + (hour * 60 + between(0, 59)) * 60_000);
      const fill = (text: string) =>
        text
          .replaceAll("{name}", name ?? "")
          .replaceAll("{first}", first)
          .replaceAll("{native}", native ?? "");
      const line = String(between(0, 99)).padStart(2, "0");
      const id = `call_${String(day).padStart(3, "0")}${n}`;

      calls.push({
        id,
        organization_id: mockOrganizationId,
        agent_id: mockAgentId,
        phone_number_id: mockMainNumber.id,
        provider_call_id: `v3:${id}`,
        from_number:
          scenario.outcome === "spam" ? `+188855501${line}` : `+1${pick(["415", "628", "510", "650"])}55501${line}`,
        to_number: mockMainNumber.e164,
        language: scenario.language,
        started_at: started.toISOString(),
        ended_at: new Date(started.getTime() + seconds * 1000).toISOString(),
        duration_seconds: seconds,
        outcome: scenario.outcome,
        transcript: scenario.turns.map(([role, text, language], index) => ({
          role,
          text: fill(text),
          language: language ?? scenario.language ?? undefined,
          at_seconds: Math.round((index * seconds) / Math.max(scenario.turns.length, 1)),
        })),
        cost_usd: Math.round((seconds / 60) * sampleCostPerMinute * 10_000) / 10_000,
        summary: fill(scenario.summary),
        caller_name: name,
      });
    }
  }

  // Today's calls that haven't happened yet.
  return calls.filter((call) => new Date(call.started_at).getTime() <= Date.now());
}

// A little over three months, so the Overview's "3 months" chart is full.
export const mockCalls: readonly Call[] = generateCalls(100);
