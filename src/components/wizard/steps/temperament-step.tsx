"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { TEMPERAMENT_PRESETS } from "@/lib/temperament-presets";
import type { Temperament } from "@/types";

// ─── Slider Definitions ─────────────────────────────────────────

interface SliderDef {
  key: keyof Temperament;
  label: string;
  left: string;
  right: string;
  simpleMode: boolean;
}

const SLIDERS: SliderDef[] = [
  { key: "valence", label: "Valence", left: "Pessimistic", right: "Optimistic", simpleMode: true },
  { key: "energy", label: "Energy", left: "Calm", right: "Energized", simpleMode: false },
  { key: "warmth", label: "Warmth", left: "Cold", right: "Empathetic", simpleMode: true },
  { key: "dominance", label: "Dominance", left: "Gentle", right: "Assertive", simpleMode: true },
  { key: "stability", label: "Stability", left: "Reactive", right: "Stable", simpleMode: false },
  { key: "autonomy", label: "Autonomy", left: "Dependent", right: "Independent", simpleMode: false },
];

// ─── Component ───────────────────────────────────────────────────

export function TemperamentStep() {
  const mounted = useMounted();
  const temperament = useWizardStore((s) => s.dna.temperament);
  const updateTemperament = useWizardStore((s) => s.updateTemperament);
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

  const visibleSliders =
    mode === "simple" ? SLIDERS.filter((s) => s.simpleMode) : SLIDERS;

  function handlePresetClick(values: Temperament) {
    updateTemperament(values);
  }

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold tracking-tight">Temperament</h2>
      <p className="mt-1 text-muted-foreground">
        Configure the emotional baseline and personality traits of your agent.
      </p>

      {/* Preset Buttons */}
      <div className="mt-4 flex flex-wrap gap-2">
        {TEMPERAMENT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => handlePresetClick(preset.values)}
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-all hover:border-primary/50 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {preset.name}
          </button>
        ))}
      </div>

      {/* Bipolar Sliders */}
      <div className="mt-6 space-y-6">
        {visibleSliders.map((slider) => (
          <div key={slider.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">{slider.label}</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {temperament[slider.key]}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
                {slider.left}
              </span>
              <Slider
                value={[temperament[slider.key]]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) =>
                  updateTemperament({ [slider.key]: val })
                }
                className="flex-1"
              />
              <span className="w-20 text-xs text-muted-foreground shrink-0">
                {slider.right}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
