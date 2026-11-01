import type { Errors } from "../../../lib/validation";
import type { AgentSettings } from "../types";

/** What every section of the receptionist form gets from the form. */
export type SectionProps = {
  values: AgentSettings;
  set: <K extends keyof AgentSettings>(key: K, value: AgentSettings[K]) => void;
  errors: Errors;
};
