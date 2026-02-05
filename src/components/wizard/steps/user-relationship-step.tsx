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
import type { UserRelationship } from "@/types";

// ─── Option Definitions ─────────────────────────────────────────

const ADDRESS_OPTIONS: { value: UserRelationship["addressForm"]; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "casual", label: "Casual" },
  { value: "friendly", label: "Friendly" },
];

const FEEDBACK_OPTIONS: { value: UserRelationship["feedbackStyle"]; label: string }[] = [
  { value: "gentle", label: "Gentle" },
  { value: "balanced", label: "Balanced" },
  { value: "direct", label: "Direct" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polish" },
  { value: "de", label: "German" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
  { value: "zh", label: "Chinese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
];

// ─── Component ───────────────────────────────────────────────────

export function UserRelationshipStep() {
  const mounted = useMounted();
  const userRelationship = useWizardStore((s) => s.dna.userRelationship);
  const updateUserRelationship = useWizardStore(
    (s) => s.updateUserRelationship
  );
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
      <h2 className="text-2xl font-bold tracking-tight">User Relationship</h2>
      <p className="mt-1 text-muted-foreground">
        Choose how your agent addresses you, gives feedback, and communicates.
      </p>

      <div className="mt-6 space-y-6">
        {/* Address Form - USER-01 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Address Form</Label>
          <div className="flex gap-2">
            {ADDRESS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={
                  userRelationship.addressForm === opt.value
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  updateUserRelationship({ addressForm: opt.value })
                }
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Feedback Style - USER-02 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Feedback Style</Label>
            <div className="flex gap-2">
              {FEEDBACK_OPTIONS.map((opt) => (
                <Button
                  key={opt.value}
                  type="button"
                  variant={
                    userRelationship.feedbackStyle === opt.value
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateUserRelationship({ feedbackStyle: opt.value })
                  }
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Proactivity - USER-03 (Advanced only) */}
        {isAdvanced && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Proactivity</Label>
              <span className="text-xs text-muted-foreground tabular-nums">
                {userRelationship.proactivity}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-20 text-xs text-muted-foreground text-right shrink-0">
                Reactive
              </span>
              <Slider
                value={[userRelationship.proactivity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([val]) =>
                  updateUserRelationship({ proactivity: val })
                }
                className="flex-1"
              />
              <span className="w-20 text-xs text-muted-foreground shrink-0">
                Proactive
              </span>
            </div>
          </div>
        )}

        {/* Language - USER-04 */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Language</Label>
          <Select
            value={userRelationship.language}
            onValueChange={(val) =>
              updateUserRelationship({ language: val })
            }
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
