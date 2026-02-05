import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  AgentDNA,
  ArchetypeId,
  CommunicationStyle,
  Domain,
  GeneratedFiles,
  Temperament,
  UserRelationship,
  WizardStep,
  WorkStyle,
} from "@/types";

// ─── Defaults ─────────────────────────────────────────────────────

const DEFAULT_TEMPERAMENT: Temperament = {
  valence: 50,
  energy: 50,
  warmth: 50,
  dominance: 50,
  stability: 50,
  autonomy: 50,
};

const DEFAULT_COMMUNICATION: CommunicationStyle = {
  formality: 50,
  humor: 2,
  directness: 50,
  responseLength: "balanced",
  structurePreference: "mixed",
  jargonLevel: 50,
};

const DEFAULT_WORK_STYLE: WorkStyle = {
  defaultDepth: 50,
  explanationStyle: "mixed",
  toolUsage: "moderate",
  uncertaintyTolerance: "balanced",
};

const DEFAULT_USER_RELATIONSHIP: UserRelationship = {
  addressForm: "casual",
  feedbackStyle: "balanced",
  proactivity: 50,
  language: "en",
};

const DEFAULT_DNA: AgentDNA = {
  archetype: null,
  temperament: { ...DEFAULT_TEMPERAMENT },
  communication: { ...DEFAULT_COMMUNICATION },
  workStyle: { ...DEFAULT_WORK_STYLE },
  userRelationship: { ...DEFAULT_USER_RELATIONSHIP },
  domains: [],
  primaryDomains: [],
};

// ─── State Shape ──────────────────────────────────────────────────

interface WizardState {
  currentStep: WizardStep;
  dna: AgentDNA;
  generatedFiles: GeneratedFiles | null;

  // Navigation
  setStep: (step: WizardStep) => void;

  // DNA updates
  updateDNA: (partial: Partial<AgentDNA>) => void;
  updateTemperament: (partial: Partial<Temperament>) => void;
  updateCommunication: (partial: Partial<CommunicationStyle>) => void;
  updateWorkStyle: (partial: Partial<WorkStyle>) => void;
  updateUserRelationship: (partial: Partial<UserRelationship>) => void;
  setArchetype: (id: ArchetypeId | null) => void;
  toggleDomain: (domain: Domain) => void;
  setPrimaryDomain: (domain: Domain) => void;
  setGeneratedFiles: (files: GeneratedFiles | null) => void;
  resetDNA: () => void;
}

// ─── Store ────────────────────────────────────────────────────────

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: "archetype",
      dna: { ...DEFAULT_DNA },
      generatedFiles: null,

      setStep: (step) => set({ currentStep: step }),

      updateDNA: (partial) =>
        set((state) => ({
          dna: { ...state.dna, ...partial },
        })),

      updateTemperament: (partial) =>
        set((state) => ({
          dna: {
            ...state.dna,
            temperament: { ...state.dna.temperament, ...partial },
          },
        })),

      updateCommunication: (partial) =>
        set((state) => ({
          dna: {
            ...state.dna,
            communication: { ...state.dna.communication, ...partial },
          },
        })),

      updateWorkStyle: (partial) =>
        set((state) => ({
          dna: {
            ...state.dna,
            workStyle: { ...state.dna.workStyle, ...partial },
          },
        })),

      updateUserRelationship: (partial) =>
        set((state) => ({
          dna: {
            ...state.dna,
            userRelationship: { ...state.dna.userRelationship, ...partial },
          },
        })),

      setArchetype: (id) =>
        set((state) => ({
          dna: { ...state.dna, archetype: id },
        })),

      toggleDomain: (domain) =>
        set((state) => {
          const domains = state.dna.domains.includes(domain)
            ? state.dna.domains.filter((d) => d !== domain)
            : [...state.dna.domains, domain];
          // Also remove from primaryDomains if domain was toggled off
          const primaryDomains = domains.includes(domain)
            ? state.dna.primaryDomains
            : state.dna.primaryDomains.filter((d) => d !== domain);
          return { dna: { ...state.dna, domains, primaryDomains } };
        }),

      setPrimaryDomain: (domain) =>
        set((state) => {
          const { primaryDomains } = state.dna;
          if (primaryDomains.includes(domain)) {
            // Remove from primary
            return {
              dna: {
                ...state.dna,
                primaryDomains: primaryDomains.filter((d) => d !== domain),
              },
            };
          }
          // Add to primary (max 3)
          if (primaryDomains.length >= 3) {
            return state;
          }
          return {
            dna: {
              ...state.dna,
              primaryDomains: [...primaryDomains, domain],
            },
          };
        }),

      setGeneratedFiles: (files) => set({ generatedFiles: files }),

      resetDNA: () =>
        set({
          currentStep: "archetype",
          dna: {
            ...DEFAULT_DNA,
            temperament: { ...DEFAULT_TEMPERAMENT },
            communication: { ...DEFAULT_COMMUNICATION },
            workStyle: { ...DEFAULT_WORK_STYLE },
            userRelationship: { ...DEFAULT_USER_RELATIONSHIP },
            domains: [],
            primaryDomains: [],
          },
          generatedFiles: null,
        }),
    }),
    {
      name: "soulgen-wizard",
      storage: createJSONStorage(() => localStorage),
      // Exclude generatedFiles from persistence (don't persist large generated content)
      partialize: (state) => ({
        currentStep: state.currentStep,
        dna: state.dna,
      }),
    }
  )
);
