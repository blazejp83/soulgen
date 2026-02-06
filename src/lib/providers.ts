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
  { id: "gpt-5.2", name: "GPT-5.2 (Latest)" },
  { id: "gpt-5", name: "GPT-5" },
  { id: "gpt-4.5", name: "GPT-4.5" },
  { id: "gpt-4.1", name: "GPT-4.1" },
  { id: "gpt-4.1-mini", name: "GPT-4.1 Mini" },
  { id: "o3", name: "o3 (Reasoning)" },
  { id: "o3-mini", name: "o3 Mini" },
];

export const ANTHROPIC_MODELS: ModelOption[] = [
  { id: "claude-opus-4-6-20260205", name: "Claude Opus 4.6 (Latest)" },
  { id: "claude-opus-4-5-20251101", name: "Claude Opus 4.5" },
  { id: "claude-sonnet-4-5-20250929", name: "Claude Sonnet 4.5" },
  { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5" },
];

export const OPENROUTER_MODELS: ModelOption[] = [
  { id: "openrouter/auto", name: "Auto (Best for prompt)" },
  { id: "anthropic/claude-opus-4.6", name: "Claude Opus 4.6" },
  { id: "anthropic/claude-sonnet-4.5", name: "Claude Sonnet 4.5" },
  { id: "openai/gpt-5.2", name: "GPT-5.2" },
  { id: "openai/gpt-4.1", name: "GPT-4.1" },
  { id: "google/gemini-2.5-pro", name: "Gemini 2.5 Pro" },
  { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash (Free)" },
  { id: "meta/llama-4", name: "Llama 4" },
  { id: "meta/llama-3.3-70b", name: "Llama 3.3 70B (Free)" },
  { id: "deepseek/deepseek-v3.2", name: "DeepSeek V3.2" },
  { id: "mistral/devstral", name: "Devstral (Coding)" },
  { id: "x-ai/grok-4.1-fast", name: "Grok 4.1 Fast" },
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
