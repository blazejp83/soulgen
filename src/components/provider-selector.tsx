"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ApiKeyInput } from "@/components/api-key-input";
import { useSettingsStore } from "@/stores/settings-store";
import { getModelList } from "@/lib/providers";
import type { Provider } from "@/types";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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

  const [open, setOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");

  const models = getModelList(activeProvider);
  const selectedModelName =
    models.find((m) => m.id === selectedModel)?.name || selectedModel;

  // Filter models by custom input
  const filteredModels = customInput
    ? models.filter(
        (m) =>
          m.name.toLowerCase().includes(customInput.toLowerCase()) ||
          m.id.toLowerCase().includes(customInput.toLowerCase())
      )
    : models;

  const handleSelectModel = (modelId: string) => {
    setModel(activeProvider, modelId);
    setCustomInput("");
    setOpen(false);
  };

  const handleCustomSubmit = () => {
    if (customInput.trim()) {
      setModel(activeProvider, customInput.trim());
      setCustomInput("");
      setOpen(false);
    }
  };

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
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between font-normal"
            >
              <span className="truncate">{selectedModelName}</span>
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
            <div className="p-2 border-b">
              <Input
                placeholder="Search or enter custom model..."
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customInput.trim()) {
                    handleCustomSubmit();
                  }
                }}
                className="h-8"
              />
            </div>
            <div className="max-h-[200px] overflow-y-auto p-1">
              {filteredModels.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectModel(m.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer",
                    selectedModel === m.id && "bg-accent"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedModel === m.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="flex-1 text-left">{m.name}</span>
                  <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                    {m.id}
                  </span>
                </button>
              ))}
              {customInput.trim() && !filteredModels.some((m) => m.id === customInput.trim()) && (
                <button
                  onClick={handleCustomSubmit}
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer border-t mt-1 pt-2"
                >
                  <span className="text-muted-foreground">Use custom:</span>
                  <span className="font-medium">{customInput.trim()}</span>
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          Select from list or type any model ID
        </p>
      </div>

      <ApiKeyInput provider={activeProvider} />
    </div>
  );
}
