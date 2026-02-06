// ─── LLM Provider Types ───────────────────────────────────────────

export type Provider = "openai" | "anthropic" | "openrouter";

export interface ProviderConfig {
  apiKey: string;
  model: string;
}

// ─── Mode Toggle ──────────────────────────────────────────────────

export type AppMode = "simple" | "advanced";

// ─── Temperament ──────────────────────────────────────────────────
// All values 0-100, default 50 = neutral

export interface Temperament {
  /** pessimistic (0) <-> optimistic (100) */
  valence: number;
  /** calm (0) <-> energized (100) */
  energy: number;
  /** cold (0) <-> empathetic (100) */
  warmth: number;
  /** gentle (0) <-> assertive (100) */
  dominance: number;
  /** reactive (0) <-> stable (100) */
  stability: number;
  /** dependent (0) <-> independent (100) */
  autonomy: number;
}

// ─── Communication Style ──────────────────────────────────────────

export interface CommunicationStyle {
  /** casual (0) <-> formal (100) */
  formality: number;
  /** none (0) <-> frequent (5) */
  humor: number;
  /** diplomatic (0) <-> blunt (100) */
  directness: number;
  responseLength: "concise" | "balanced" | "thorough";
  structurePreference: "prose" | "mixed" | "structured";
  /** plain (0) <-> technical (100) */
  jargonLevel: number;
}

// ─── Work Style ───────────────────────────────────────────────────

export interface WorkStyle {
  /** overview (0) <-> deep-dive (100) */
  defaultDepth: number;
  explanationStyle: "examples" | "analogies" | "first-principles" | "mixed";
  toolUsage: "minimal" | "moderate" | "heavy";
  uncertaintyTolerance: "cautious" | "balanced" | "bold";
}

// ─── User Relationship ───────────────────────────────────────────

export interface UserRelationship {
  addressForm: "formal" | "casual" | "friendly";
  feedbackStyle: "gentle" | "balanced" | "direct";
  /** reactive (0) <-> proactive (100) */
  proactivity: number;
  /** e.g. 'en', 'pl' */
  language: string;
}

// ─── Archetype ────────────────────────────────────────────────────

export type ArchetypeId =
  | "developer"
  | "researcher"
  | "devops"
  | "pm"
  | "coach"
  | "storyteller"
  | "general"
  | "custom";

// ─── Domain Tags ──────────────────────────────────────────────────

export type Domain =
  | "coding"
  | "research"
  | "automation"
  | "writing"
  | "planning"
  | "media";

// ─── Agent DNA ────────────────────────────────────────────────────
// The complete DNA object accumulated by the wizard

export interface AgentDNA {
  archetype: ArchetypeId | null;
  temperament: Temperament;
  communication: CommunicationStyle;
  workStyle: WorkStyle;
  userRelationship: UserRelationship;
  domains: Domain[];
  /** max 2-3 */
  primaryDomains: Domain[];
}

// ─── Wizard Step Tracking ─────────────────────────────────────────

export type WizardStep =
  | "archetype"
  | "temperament"
  | "communication"
  | "work-style"
  | "user-relationship"
  | "domains"
  | "summary";

// ─── Generated Files ─────────────────────────────────────────────

export interface GeneratedFiles {
  soul: string;     // SOUL.md content
  identity: string; // IDENTITY.md content
  user: string;     // USER.md content
}

// ─── File History (Undo/Redo) ────────────────────────────────────

export interface FileHistory {
  past: string[];
  present: string;
  future: string[];
}

// ─── Preview Mode ────────────────────────────────────────────────

export type PreviewMode = "rendered" | "raw" | "edit";
