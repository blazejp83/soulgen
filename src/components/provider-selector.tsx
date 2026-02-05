"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { ApiKeyInput } from "@/components/api-key-input";
import { useSettingsStore } from "@/stores/settings-store";
import { getModelList } from "@/lib/providers";
import type { Provider } from "@/types";

const PROVIDERS: { value: Provider; label: string }[] = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "openrouter", label: "OpenRouter" },
];

export function ProviderSelector() {
  const activeProvider = useSettingsStore((s) => s.activeProvider);
  const setActiveProvider = useSettingsStore((s) => s.setActiveProvider);
  const selectedModel = useSettingsStore(
    (s) => s.providers[activeProvider].model
  );
  const setModel = useSettingsStore((s) => s.setModel);

  const models = getModelList(activeProvider);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Provider</Label>
        <Tabs
          value={activeProvider}
          onValueChange={(v) => setActiveProvider(v as Provider)}
        >
          <TabsList className="w-full">
            {PROVIDERS.map((p) => (
              <TabsTrigger key={p.value} value={p.value} className="flex-1">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-2">
        <Label htmlFor="model-select">Model</Label>
        <Select
          value={selectedModel}
          onValueChange={(v) => setModel(activeProvider, v)}
        >
          <SelectTrigger id="model-select" className="w-full">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ApiKeyInput provider={activeProvider} />
    </div>
  );
}
