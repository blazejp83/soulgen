"use client";

import { useState, useCallback } from "react";
import type { FileHistory } from "@/types";

const MAX_HISTORY_ENTRIES = 50;

interface UseFileHistoryReturn {
  content: string;
  setContent: (content: string) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (content: string) => void;
}

/**
 * Hook for managing file edit history with undo/redo support.
 * Limits history to MAX_HISTORY_ENTRIES to avoid memory bloat.
 */
export function useFileHistory(initialContent: string): UseFileHistoryReturn {
  const [history, setHistory] = useState<FileHistory>({
    past: [],
    present: initialContent,
    future: [],
  });

  const setContent = useCallback((newContent: string) => {
    setHistory((prev) => {
      // Don't push if content is the same
      if (newContent === prev.present) return prev;

      // Limit past entries to prevent memory bloat
      const newPast = [...prev.past, prev.present].slice(-MAX_HISTORY_ENTRIES);

      return {
        past: newPast,
        present: newContent,
        future: [], // Clear future on new edit
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const previousContent = prev.past[prev.past.length - 1];
      const newFuture = [prev.present, ...prev.future];

      return {
        past: newPast,
        present: previousContent,
        future: newFuture,
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const [nextContent, ...restFuture] = prev.future;
      const newPast = [...prev.past, prev.present];

      return {
        past: newPast,
        present: nextContent,
        future: restFuture,
      };
    });
  }, []);

  const reset = useCallback((newContent: string) => {
    setHistory({
      past: [],
      present: newContent,
      future: [],
    });
  }, []);

  return {
    content: history.present,
    setContent,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    reset,
  };
}
