import type { Region } from "./types";

export const regions: readonly { id: Region; label: string }[] = [
  { id: "us", label: "United States" },
  { id: "eu", label: "European Union" },
  { id: "in", label: "India" },
];
