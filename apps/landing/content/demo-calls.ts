// The live call demo: one example call per language, worded as in the approved design's demos().
// They're illustrations, labeled as examples on the page, never real customers.

export type Outcome = "booked" | "transferred" | "message" | "spam";

export type DemoCall = {
  id: string;
  /** BCP 47 tag for the call, e.g. "hi-Latn" for Hindi written in Latin letters. */
  lang: string;
  /** The language's own name, on its button. */
  label: string;
  business: string;
  dir: "ltr" | "rtl";
  /** Shown in English, as the dashboard would show it. */
  outcome: { kind: Outcome; label: string };
  turns: { speaker: "ai" | "caller"; text: string }[];
};

export const demoCalls: readonly DemoCall[] = [
  {
    id: "en",
    lang: "en",
    label: "English",
    business: "Rivera Plumbing",
    dir: "ltr",
    outcome: { kind: "booked", label: "Booked · Tomorrow 10:00 am" },
    turns: [
      { speaker: "ai", text: "Thanks for calling Rivera Plumbing. I'm the AI receptionist. How can I help?" },
      { speaker: "caller", text: "My kitchen sink is leaking. Can someone come tomorrow?" },
      { speaker: "ai", text: "Of course. I have 10 am or 2 pm tomorrow. Which works for you?" },
      { speaker: "caller", text: "10 am, please. It's Maria Lopez." },
      { speaker: "ai", text: "Maria Lopez, tomorrow at 10 am. You are booked. See you then!" },
    ],
  },
  {
    id: "fr",
    lang: "fr",
    label: "Français",
    business: "Cabinet dentaire Lumière",
    dir: "ltr",
    outcome: { kind: "booked", label: "Booked · Thu 9:00 am" },
    turns: [
      {
        speaker: "ai",
        text: "Cabinet dentaire Lumière, bonjour. Je suis l'assistante IA. Comment puis-je vous aider ?",
      },
      { speaker: "caller", text: "Bonjour, je voudrais un rendez-vous pour un détartrage." },
      { speaker: "ai", text: "Bien sûr. J'ai jeudi à 9 h ou vendredi à 14 h. Qu'est-ce qui vous convient ?" },
      { speaker: "caller", text: "Jeudi à 9 h, c'est parfait. Claire Martin." },
      { speaker: "ai", text: "C'est noté : Claire Martin, jeudi à 9 h. À jeudi !" },
    ],
  },
  {
    id: "ar",
    lang: "ar",
    label: "العربية",
    business: "فندق النخيل",
    dir: "rtl",
    outcome: { kind: "booked", label: "Booked · Friday night" },
    turns: [
      { speaker: "ai", text: "مرحباً بك في فندق النخيل، معك المساعد الذكي. كيف يمكنني مساعدتك؟" },
      { speaker: "caller", text: "أريد حجز غرفة لشخصين ليلة الجمعة." },
      { speaker: "ai", text: "لدينا غرفة مزدوجة متاحة ليلة الجمعة. هل أؤكد الحجز؟" },
      { speaker: "caller", text: "نعم من فضلك، باسم أحمد خالد." },
      { speaker: "ai", text: "تم الحجز باسم أحمد خالد ليلة الجمعة. نراك قريباً!" },
    ],
  },
  {
    id: "hi",
    lang: "hi-Latn",
    label: "Hinglish",
    business: "Glow Salon",
    dir: "ltr",
    outcome: { kind: "booked", label: "Booked · Tomorrow 6:30 pm" },
    turns: [
      {
        speaker: "ai",
        text: "Namaste, Glow Salon mein aapka swagat hai. Main AI receptionist hoon. Kaise help karun?",
      },
      { speaker: "caller", text: "Hi, kal shaam haircut ka appointment mil sakta hai?" },
      { speaker: "ai", text: "Haan bilkul. Kal 5 baje ya 6:30 baje slot free hai. Kaunsa chalega?" },
      { speaker: "caller", text: "6:30 perfect hai. Naam Rohan Mehta." },
      { speaker: "ai", text: "Done! Rohan Mehta, kal shaam 6:30 baje. See you!" },
    ],
  },
  {
    id: "de",
    lang: "de",
    label: "Deutsch",
    business: "Werkstatt Weber",
    dir: "ltr",
    outcome: { kind: "transferred", label: "Transferred · to the workshop lead" },
    turns: [
      { speaker: "ai", text: "Werkstatt Weber, guten Tag. Hier spricht die KI-Rezeption. Wie kann ich helfen?" },
      {
        speaker: "caller",
        text: "Meine Bremsen quietschen seit heute Morgen. Kann sich das heute noch jemand ansehen?",
      },
      { speaker: "ai", text: "Das klingt dringend. Ich verbinde Sie direkt mit unserem Meister." },
      { speaker: "caller", text: "Super, danke." },
      { speaker: "ai", text: "Einen Moment bitte, ich stelle Sie durch." },
    ],
  },
];
