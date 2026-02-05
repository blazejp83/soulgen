import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AppMode, Provider, ProviderConfig } from "@/types";

// ─── State Shape ──────────────────────────────────────────────────

interface SettingsState {
  mode: AppMode;
  activeProvider: Provider;
  providers: Record<Provider, ProviderConfig>;

  // Actions
  setMode: (mode: AppMode) => void;
  setActiveProvider: (provider: Provider) => void;
  setApiKey: (provider: Provider, key: string) => void;
  setModel: (provider: Provider, model: string) => void;
}

// ─── Default Provider Configs ─────────────────────────────────────

const DEFAULT_PROVIDERS: Record<Provider, ProviderConfig> = {
  openai: { apiKey: "", model: "gpt-4o" },
  anthropic: { apiKey: "", model: "claude-sonnet-4-20250514" },
  openrouter: { apiKey: "", model: "openrouter/auto" },
};

// ─── Store ────────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      mode: "simple",
      activeProvider: "openai",
      providers: { ...DEFAULT_PROVIDERS },

      setMode: (mode) => set({ mode }),

      setActiveProvider: (provider) => set({ activeProvider: provider }),

      setApiKey: (provider, key) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: { ...state.providers[provider], apiKey: key },
          },
        })),

      setModel: (provider, model) =>
        set((state) => ({
          providers: {
            ...state.providers,
            [provider]: { ...state.providers[provider], model },
          },
        })),
    }),
    {
      name: "soulgen-settings",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
