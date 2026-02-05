"use client";

import { useState, useCallback, useRef } from "react";
import { useWizardStore } from "@/stores/wizard-store";
import { useSettingsStore } from "@/stores/settings-store";
import { buildGenerationPrompt } from "@/lib/prompt-builder";
import { GenerationParser } from "@/lib/parse-generation";
import type { GeneratedFiles } from "@/types";

// ─── Types ───────────────────────────────────────────────────────

export type ActiveFile = "soul" | "identity" | "user" | null;

export interface UseGenerationReturn {
  generate: () => Promise<void>;
  isGenerating: boolean;
  error: string | null;
  files: GeneratedFiles | null;
  activeFile: ActiveFile;
  reset: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────

export function useGeneration(): UseGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<GeneratedFiles | null>(null);
  const [activeFile, setActiveFile] = useState<ActiveFile>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Get DNA and settings
  const dna = useWizardStore((s) => s.dna);
  const setGeneratedFiles = useWizardStore((s) => s.setGeneratedFiles);

  const activeProvider = useSettingsStore((s) => s.activeProvider);
  const providers = useSettingsStore((s) => s.providers);

  const generate = useCallback(async () => {
    // Validate API key
    const providerConfig = providers[activeProvider];
    if (!providerConfig.apiKey) {
      setError("Please configure your API key in Settings");
      return;
    }

    // Reset state
    setIsGenerating(true);
    setError(null);
    setFiles(null);
    setActiveFile(null);

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Build prompt
      const { system, userMessage } = buildGenerationPrompt(dna);

      // Make request
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: activeProvider,
          apiKey: providerConfig.apiKey,
          model: providerConfig.model,
          messages: [{ role: "user", content: userMessage }],
          system,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("Response body is empty");
      }

      // Stream response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const parser = new GenerationParser();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const currentFiles = parser.push(chunk);

        // Update active file based on parser state
        const currentFileKey = parser.getCurrentFile();
        if (currentFileKey && currentFileKey !== activeFile) {
          setActiveFile(currentFileKey);
        }

        // Update files state for real-time display
        setFiles({ ...currentFiles });
      }

      // Get final result
      const finalFiles = parser.getResult();
      setFiles(finalFiles);
      setGeneratedFiles(finalFiles);
      setActiveFile(null);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Generation was cancelled");
        } else {
          setError(err.message);
        }
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [dna, activeProvider, providers, setGeneratedFiles]);

  const reset = useCallback(() => {
    // Abort any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setIsGenerating(false);
    setError(null);
    setFiles(null);
    setActiveFile(null);
    setGeneratedFiles(null);
  }, [setGeneratedFiles]);

  return {
    generate,
    isGenerating,
    error,
    files,
    activeFile,
    reset,
  };
}
