import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@receptionist/ui/components/tabs";
import { CircleX } from "lucide-react";
import { type ComponentType, useState } from "react";
import { SaveBar } from "../../../components/save-bar";
import { useValidatedForm } from "../../../hooks/use-validated-form";
import { formatRelative } from "../../../lib/format";
import { useSaveAgentConfig } from "../api";
import type { AgentConfig, AgentSettings } from "../types";
import { type Section, sectionOf, validateAgentSettings } from "../validation";
import { BusinessSection } from "./business-section";
import { FaqSection } from "./faq-section";
import { GreetingSection } from "./greeting-section";
import { LanguagesSection } from "./languages-section";
import type { SectionProps } from "./settings-card";
import { TransfersSection } from "./transfers-section";
import { VoiceSection } from "./voice-section";

const sections: { id: Section; label: string; component: ComponentType<SectionProps> }[] = [
  { id: "greeting", label: "Greeting", component: GreetingSection },
  { id: "business", label: "Business and hours", component: BusinessSection },
  { id: "languages", label: "Languages", component: LanguagesSection },
  { id: "voice", label: "Voice", component: VoiceSection },
  { id: "transfers", label: "Transfers", component: TransfersSection },
  { id: "faqs", label: "FAQ", component: FaqSection },
];

function settingsOf({ id: _id, agent_id: _agent, version: _version, created_at: _created, ...settings }: AgentConfig) {
  return settings satisfies AgentSettings;
}

/** All of a receptionist's settings in tabs, saved together as a new version. */
export function ReceptionistForm({ config }: { config: AgentConfig }) {
  const save = useSaveAgentConfig(config.agent_id);
  const [baseline, setBaseline] = useState(() => settingsOf(config));
  const [savedVersion, setSavedVersion] = useState<number>();
  const [tab, setTab] = useState<Section>("greeting");
  const form = useValidatedForm(baseline, validateAgentSettings);
  const dirty = JSON.stringify(form.values) !== JSON.stringify(baseline);
  const invalidSections = new Set(Object.keys(form.errors).map(sectionOf));

  const onSubmit = form.handleSubmit(
    (values) =>
      save.mutate(values, {
        onSuccess: (saved) => {
          const next = settingsOf(saved);
          setBaseline(next);
          form.reset(next);
          setSavedVersion(saved.version);
        },
      }),
    (errors) => {
      const first = Object.keys(errors)[0];
      if (first && !Object.keys(errors).some((key) => sectionOf(key) === tab)) setTab(sectionOf(first));
    },
  );

  const status = dirty
    ? "You have unsaved changes."
    : savedVersion
      ? `Saved. Version ${savedVersion} is live on your calls.`
      : `Version ${config.version}, saved ${formatRelative(config.created_at)}.`;

  return (
    <form ref={form.formRef} onSubmit={onSubmit} noValidate>
      <Tabs value={tab} onValueChange={(value) => setTab(value as Section)}>
        <div className="-mx-4 overflow-x-auto overflow-y-hidden px-4 pb-1.5 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <TabsList variant="line" className="w-max">
            {sections.map((section) => (
              <TabsTrigger key={section.id} value={section.id} className="px-2.5">
                {section.label}
                {invalidSections.has(section.id) && (
                  <span className="size-1.5 rounded-full bg-destructive">
                    <span className="sr-only">, has errors</span>
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        {sections.map((section) => (
          <TabsContent key={section.id} value={section.id} className="mt-4">
            <section.component values={form.values} set={form.set} errors={form.errors} />
          </TabsContent>
        ))}
      </Tabs>

      {save.isError && (
        <Alert variant="destructive" className="mt-4">
          <CircleX />
          <AlertTitle>Couldn't save your changes</AlertTitle>
          <AlertDescription>Nothing was changed on your calls. Try again in a moment.</AlertDescription>
        </Alert>
      )}

      <SaveBar status={status} dirty={dirty} saving={save.isPending} onDiscard={() => form.reset(baseline)} />
    </form>
  );
}
