import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AgentDNA, SavedProfile } from "@/types";

// ─── State Shape ──────────────────────────────────────────────────

interface ProfileState {
  profiles: SavedProfile[];

  // Actions
  saveProfile: (name: string, dna: AgentDNA) => void;
  loadProfile: (id: string) => AgentDNA | null;
  deleteProfile: (id: string) => void;
  renameProfile: (id: string, newName: string) => void;
}

// ─── ID Generation ─────────────────────────────────────────────────

function generateId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ─── Store ────────────────────────────────────────────────────────

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],

      saveProfile: (name, dna) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;

        const now = new Date().toISOString();
        const { profiles } = get();

        // Check if profile with same name exists
        const existingIndex = profiles.findIndex(
          (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingIndex !== -1) {
          // Update existing profile
          const updated = [...profiles];
          updated[existingIndex] = {
            ...updated[existingIndex],
            dna,
            updatedAt: now,
          };
          set({ profiles: updated });
        } else {
          // Create new profile
          const newProfile: SavedProfile = {
            id: generateId(),
            name: trimmedName,
            dna,
            createdAt: now,
            updatedAt: now,
          };
          set({ profiles: [...profiles, newProfile] });
        }
      },

      loadProfile: (id) => {
        const { profiles } = get();
        const profile = profiles.find((p) => p.id === id);
        return profile?.dna ?? null;
      },

      deleteProfile: (id) => {
        const { profiles } = get();
        set({ profiles: profiles.filter((p) => p.id !== id) });
      },

      renameProfile: (id, newName) => {
        const trimmedName = newName.trim();
        if (!trimmedName) return;

        const { profiles } = get();
        const updated = profiles.map((p) =>
          p.id === id
            ? { ...p, name: trimmedName, updatedAt: new Date().toISOString() }
            : p
        );
        set({ profiles: updated });
      },
    }),
    {
      name: "soulgen-profiles",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
