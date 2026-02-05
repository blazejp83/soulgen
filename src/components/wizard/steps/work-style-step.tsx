"use client";

import { useWizardStore } from "@/stores/wizard-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { WorkStyle } from "@/types";

// ─── Option Definitions ─────────────────────────────────────────

const EXPLANATION_OPTIONS: { value: WorkStyle["explanationStyle"]; label: string }[] = [
  { value: "examples", label: "Examples" },
  { value: "analogies", label: "Analogies" },
  { value: "first-principles", label: "First Principles" },
  { value: "mixed", label: "Mixed" },
];

const TOOL_USAGE_OPTIONS: { value: WorkStyle["toolUsage"]; label: string }[] = [
  { value: "minimal", label: "Minimal" },
  { value: "moderate", label: "Moderate" },
  { value: "heavy", label: "Heavy" },
];

const UNCERTAINTY_OPTIONS: { value: WorkStyle["uncertaintyTolerance"]; label: string }[] = [
  { value: "cautious", label: "Cautious" },
  { value: "balanced", label: "Balanced" },
  { value: "bold", label: "Bold" },
];

// ─── Component ───────────────────────────────────────────────────

export function WorkStyleStep() {
  const mounted = useMounted();
  const workStyle = useWizardStore((s) => s.dna.workStyle);
  const updateWorkStyle = useWizardStore((s) => s.updateWorkStyle);
  const mode = useSettingsStore((s) => s.mode);

  if (!mounted) {
    return (
      <div className="py-6">
        <div className="h-8 w-56 rounded bg-muted animate-pulse" />
        <div className="mt-1 h-5 w-80 rounded bg-muted/60 animate-pulse" />
        <div className="mt-6 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-muted/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const isAdvanced = mode === "advanced";

  return (
    <div className="py-6">
      <h2 className="text-2xl font-bold tracking-tight">Work Style</h2>
      <p className="mt-1 text-muted-foreground">
        Define how your agent approaches tasks: depth, explanations, and decision-making.
      </p>

      <div className="mt-6 space-y-6">
        {/* Default Depth - WORK-01 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Default Depth</Label>
            <span className="text-xs text-muted-foreground tabular-nums">
              {workStyle.defaultDepth}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
              Overview
            </span>
            <Slider
              value={[workStyle.defaultDepth]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) =>
                updateWorkStyle({ defaultDepth: val })
              }
              className="flex-1"
            />
            <span className="w-20 text-xs text-muted-foreground shrink-0">
              Deep Dive
            </span>
          </div>
        </div>

        {/* Explanation Style - WORK-02 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Explanation Style</Label>
          <div className="flex flex-wrap gap-2">
            {EXPLANATION_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={
                  workStyle.explanationStyle === opt.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  updateWorkStyle({ explanationStyle: opt.value })
                }
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Tool Usage - WORK-03 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tool Usage</Label>
            <div className="flex gap-2">
              {TOOL_USAGE_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={
                    workStyle.toolUsage === opt.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateWorkStyle({ toolUsage: opt.value })
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Uncertainty Tolerance - WORK-04 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Uncertainty Tolerance</Label>
            <div className="flex gap-2">
              {UNCERTAINTY_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={
                    workStyle.uncertaintyTolerance === opt.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateWorkStyle({ uncertaintyTolerance: opt.value })
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
