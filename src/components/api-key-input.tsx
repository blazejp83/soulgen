"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSettingsStore } from "@/stores/settings-store";
import type { Provider } from "@/types";

interface ApiKeyInputProps {
  provider: Provider;
}

export function ApiKeyInput({ provider }: ApiKeyInputProps) {
  const [showKey, setShowKey] = useState(false);
  const apiKey = useSettingsStore(
    (s) => s.providers[provider].apiKey
  );
  const setApiKey = useSettingsStore((s) => s.setApiKey);

  return (
    <div className="space-y-2">
      <Label htmlFor={`api-key-${provider}`}>API Key</Label>
      <div className="relative">
        <Input
          id={`api-key-${provider}`}
          type={showKey ? "text" : "password"}
          placeholder={`Enter your ${provider} API key`}
          value={apiKey}
          onChange={(e) => setApiKey(provider, e.target.value)}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={() => setShowKey(!showKey)}
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {showKey ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Stored locally in your browser. Never sent to our servers.
      </p>
    </div>
  );
}
