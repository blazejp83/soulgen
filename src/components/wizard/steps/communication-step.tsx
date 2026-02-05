"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CommunicationStyle } from "@/types";

// ─── Option Definitions ─────────────────────────────────────────

const RESPONSE_LENGTH_OPTIONS: { value: CommunicationStyle["responseLength"]; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "balanced", label: "Balanced" },
  { value: "thorough", label: "Thorough" },
];

const STRUCTURE_OPTIONS: { value: CommunicationStyle["structurePreference"]; label: string }[] = [
  { value: "prose", label: "Prose" },
  { value: "mixed", label: "Mixed" },
  { value: "structured", label: "Structured" },
];

// ─── Component ───────────────────────────────────────────────────

export function CommunicationStep() {
  const mounted = useMounted();
  const communication = useWizardStore((s) => s.dna.communication);
  const updateCommunication = useWizardStore((s) => s.updateCommunication);
  const mode = useSettingsStore((s) => s.mode);

  if (!mounted) {
    return (
      <div className="py-6">
        <div className="h-8 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-1 h-5 w-80 rounded bg-muted/60 animate-pulse" />
        <div className="mt-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isAdvanced = mode === "advanced";

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold tracking-tight">Communication Style</h2>
      <p className="mt-1 text-muted-foreground">
        Set how your agent communicates: tone, humor, directness, and response format.
      </p>

      <div className="mt-6 space-y-6">
        {/* Formality - COMM-01 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Formality</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {communication.formality}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
              Casual
            </span>
            <Slider
              value={[communication.formality]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) =>
                updateCommunication({ formality: val })
              }
              className="flex-1"
            />
            <span className="w-20 text-xs text-muted-foreground shrink-0">
              Formal
            </span>
          </div>
        </div>

        {/* Humor - COMM-02 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Humor</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {communication.humor}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
                None
              </span>
              <Slider
                value={[communication.humor]}
                min={0}
                max={5}
                step={1}
                onValueChange={([val]) =>
                  updateCommunication({ humor: val })
                }
                className="flex-1"
              />
              <span className="w-20 text-xs text-muted-foreground shrink-0">
                Frequent
              </span>
            </div>
          </div>
        )}

        {/* Directness - COMM-03 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Directness</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {communication.directness}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
              Diplomatic
            </span>
            <Slider
              value={[communication.directness]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) =>
                updateCommunication({ directness: val })
              }
              className="flex-1"
            />
            <span className="w-20 text-xs text-muted-foreground shrink-0">
              Blunt
            </span>
          </div>
        </div>

        {/* Response Length - COMM-04 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Response Length</Label>
          <div className="flex gap-2">
            {RESPONSE_LENGTH_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={
                  communication.responseLength === opt.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  updateCommunication({ responseLength: opt.value })
                }
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Structure Preference - COMM-05 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Structure Preference</Label>
            <div className="flex gap-2">
              {STRUCTURE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={
                    communication.structurePreference === opt.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateCommunication({ structurePreference: opt.value })
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Jargon Level - COMM-06 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Jargon Level</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {communication.jargonLevel}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
                Plain
              </span>
              <Slider
                value={[communication.jargonLevel]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) =>
                  updateCommunication({ jargonLevel: val })
                }
                className="flex-1"
              />
              <span className="w-20 text-xs text-muted-foreground shrink-0">
                Technical
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
