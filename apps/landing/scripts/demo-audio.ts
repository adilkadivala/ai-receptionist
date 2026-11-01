// Records the live call demo's voices with Cartesia, the voice real callers hear. Run it after editing
// content/demo-calls.ts. The clips are committed to public/demo-audio/, so the site never needs the key.
//
//   pnpm --filter @receptionist/landing demo-audio            records the lines that have no clip yet
//   pnpm --filter @receptionist/landing demo-audio --force    records every line again
//
// Reads CARTESIA_API_KEY from the environment or from apps/server/.env. The voices are picked once per call and
// side, then saved in demo-voices.json next to this script, so a re-run keeps the same voices. Edit that file to
// choose others (voice IDs from play.cartesia.ai).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { audioPath, demoCalls, type Speaker } from "../content/demo-calls.ts";

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, "../public");
const voicesFile = join(here, "demo-voices.json");
const api = "https://api.cartesia.ai";
const apiVersion = "2026-08-14";
const model = "sonic-3.6";

type Gender = "feminine" | "masculine";
type Voice = { id: string; name: string; language: string };
type VoiceChoice = { id: string; name: string };

// The receptionist matches its script's grammar (French "l'assistante", Arabic "المساعد"); callers match their names.
const genders: Record<string, Record<Speaker, Gender>> = {
  en: { ai: "feminine", caller: "feminine" },
  fr: { ai: "feminine", caller: "feminine" },
  ar: { ai: "masculine", caller: "masculine" },
  hi: { ai: "feminine", caller: "masculine" },
  de: { ai: "feminine", caller: "masculine" },
};

function readApiKey(): string {
  if (process.env.CARTESIA_API_KEY) return process.env.CARTESIA_API_KEY;
  const envFile = join(here, "../../server/.env");
  const line = existsSync(envFile)
    ? readFileSync(envFile, "utf8")
        .split("\n")
        .find((entry) => entry.startsWith("CARTESIA_API_KEY="))
    : undefined;
  const value = line
    ?.slice("CARTESIA_API_KEY=".length)
    .trim()
    .replace(/^["']|["']$/g, "");
  if (!value) throw new Error("Set CARTESIA_API_KEY in apps/server/.env (see .env.example) or in the environment.");
  return value;
}

const apiKey = readApiKey();

async function cartesia(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${api}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${apiKey}`, "Cartesia-Version": apiVersion, "Content-Type": "application/json" },
  });
  if (!response.ok) throw new Error(`Cartesia ${path}: ${response.status} ${await response.text()}`);
  return response;
}

/** A voice whose own language is `language`, so it has a native accent. */
async function pickVoice(language: string, gender: Gender, avoid?: string): Promise<VoiceChoice> {
  const query = new URLSearchParams({ language, gender, limit: "100" });
  const { data } = (await (await cartesia(`/voices?${query}`)).json()) as { data: Voice[] };
  const choice = data.find((voice) => voice.language === language && voice.id !== avoid);
  if (!choice) throw new Error(`Cartesia has no ${gender} voice whose own language is ${language}.`);
  return { id: choice.id, name: choice.name };
}

const voices: Record<string, Record<Speaker, VoiceChoice>> = existsSync(voicesFile)
  ? JSON.parse(readFileSync(voicesFile, "utf8"))
  : {};

for (const call of demoCalls) {
  if (voices[call.id]) continue;
  const sides = genders[call.voiceLanguage];
  if (!sides) throw new Error(`Add ${call.voiceLanguage} to genders in scripts/demo-audio.ts.`);
  const ai = await pickVoice(call.voiceLanguage, sides.ai);
  voices[call.id] = { ai, caller: await pickVoice(call.voiceLanguage, sides.caller, ai.id) };
}
writeFileSync(voicesFile, `${JSON.stringify(voices, null, 2)}\n`);

mkdirSync(join(publicDir, "demo-audio"), { recursive: true });
const force = process.argv.includes("--force");
let characters = 0;

for (const call of demoCalls) {
  for (const [line, turn] of call.turns.entries()) {
    const path = audioPath(call, line);
    if (!force && existsSync(join(publicDir, path))) continue;
    const voice = voices[call.id]?.[turn.speaker];
    if (!voice) throw new Error(`No ${turn.speaker} voice for ${call.id} in demo-voices.json.`);
    const transcript = turn.speech ?? turn.text;
    const response = await cartesia("/tts/bytes", {
      method: "POST",
      body: JSON.stringify({
        model_id: model,
        transcript,
        voice: voice.id,
        language: call.voiceLanguage,
        output_format: { container: "mp3", sample_rate: 44100, bit_rate: 96000 },
      }),
    });
    writeFileSync(join(publicDir, path), Buffer.from(await response.arrayBuffer()));
    characters += transcript.length;
    console.log(`${path}  ${voice.name}`);
  }
}

console.log(`Recorded ${characters} characters.`);
