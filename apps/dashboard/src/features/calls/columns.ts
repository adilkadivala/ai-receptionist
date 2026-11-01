/** Call table columns people can hide from the Columns menu. Caller and the actions always show. */
export const optionalColumns = [
  { id: "summary", label: "What they needed" },
  { id: "language", label: "Language" },
  { id: "outcome", label: "Outcome" },
  { id: "length", label: "Length" },
  { id: "time", label: "Time" },
] as const;

export type OptionalColumn = (typeof optionalColumns)[number]["id"];
