"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";
import { useMounted } from "@/hooks/use-mounted";

export function ModeToggle() {
  const mounted = useMounted();
  const mode = useSettingsStore((s) => s.mode);
  const setMode = useSettingsStore((s) => s.setMode);

  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Simple</span>
        <Switch disabled />
        <span className="text-sm text-muted-foreground">Advanced</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Label
        htmlFor="mode-toggle"
        className={`text-sm cursor-pointer ${
          mode === "simple" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        Simple
      </Label>
      <Switch
        id="mode-toggle"
        checked={mode === "advanced"}
        onCheckedChange={(checked) =>
          setMode(checked ? "advanced" : "simple")
        }
      />
      <Label
        htmlFor="mode-toggle"
        className={`text-sm cursor-pointer ${
          mode === "advanced" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        Advanced
      </Label>
    </div>
  );
}
