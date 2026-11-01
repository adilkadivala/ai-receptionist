import { Alert, AlertDescription, AlertTitle } from "@receptionist/ui/components/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@receptionist/ui/components/tabs";
import { CircleX } from "lucide-react";
import { type ComponentType, useState } from "react";
import { toast } from "sonner";
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
import type { SectionProps } from "./section-props";
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
          toast.success(`Saved. Version ${saved.version} is live on your calls.`);
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
      ? `Version ${savedVersion}, saved just now.`
      : `Version ${config.version}, saved ${formatRelative(config.created_at)}.`;

  return (
    <form ref={form.formRef} onSubmit={onSubmit} noValidate className="flex flex-1 flex-col">
      <Tabs value={tab} onValueChange={(value) => setTab(value as Section)} className="mb-6 max-w-5xl">
        {/* The tab bar the landing page draws for the dashboard: white, resting on the sheet, the current tab in grey.
            The vertical padding keeps its shadow inside the scroller. */}
        <div className="-mx-4 -my-2 overflow-x-auto overflow-y-hidden px-4 py-2 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <TabsList
            aria-label="Receptionist settings"
            className="h-10! w-max rounded-[12px] bg-card p-1 shadow-(--raised)"
          >
            {sections.map((section) => (
              <TabsTrigger
                key={section.id}
                value={section.id}
                className="rounded-[9px] px-3 text-[13px] text-foreground/70 data-active:bg-hero group-data-[variant=default]/tabs-list:data-active:shadow-none"
              >
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
        <Alert variant="destructive" className="mt-4 max-w-5xl">
          <CircleX />
          <AlertTitle>Couldn't save your changes</AlertTitle>
          <AlertDescription>Nothing was changed on your calls. Try again in a moment.</AlertDescription>
        </Alert>
      )}

      <SaveBar status={status} dirty={dirty} saving={save.isPending} onDiscard={() => form.reset(baseline)} />
    </form>
  );
}
