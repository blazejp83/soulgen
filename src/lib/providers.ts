import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import type { Provider } from "@/types";

// ─── Model Lists ─────────────────────────────────────────────────

export interface ModelOption {
  id: string;
  name: string;
}

export const OPENAI_MODELS: ModelOption[] = [
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
  { id: "gpt-4.1-nano", name: "GPT-4.1 Nano" },
];

export const ANTHROPIC_MODELS: ModelOption[] = [
  { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
  { id: "claude-haiku-3-5-20241022", name: "Claude 3.5 Haiku" },
];

export const OPENROUTER_MODELS: ModelOption[] = [
  { id: "openrouter/auto", name: "Auto (Best for prompt)" },
  { id: "anthropic/claude-sonnet-4-20250514", name: "Claude Sonnet 4" },
  { id: "openai/gpt-4o", name: "GPT-4o" },
  { id: "google/gemini-2.5-flash-preview", name: "Gemini 2.5 Flash" },
];

// ─── Model List Lookup ───────────────────────────────────────────

export function getModelList(provider: Provider): ModelOption[] {
  switch (provider) {
    case "openai":
      return OPENAI_MODELS;
    case "anthropic":
      return ANTHROPIC_MODELS;
    case "openrouter":
      return OPENROUTER_MODELS;
  }
}

// ─── Provider Instances ──────────────────────────────────────────

export function getProvider(provider: Provider, apiKey: string) {
  switch (provider) {
    case "openai":
      return createOpenAI({ apiKey });
    case "anthropic":
      return createAnthropic({ apiKey });
    case "openrouter":
      return createOpenRouter({ apiKey });
  }
}

// ─── Model Instance ──────────────────────────────────────────────

export function getModel(provider: Provider, apiKey: string, modelId: string) {
  const p = getProvider(provider, apiKey);
  return p(modelId);
}
