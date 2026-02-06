import type { AgentDNA, GeneratedFiles } from "@/types";

// ─── ZIP Export ────────────────────────────────────────────────────

/**
 * Download generated files as a ZIP archive
 */
export async function downloadZip(files: GeneratedFiles): Promise<void> {
  // Dynamic import to avoid SSR issues
  const { downloadZip: createZip } = await import("client-zip");

  const zipFiles = [
    { name: "SOUL.md", input: files.soul },
    { name: "IDENTITY.md", input: files.identity },
    { name: "USER.md", input: files.user },
  ];

  const blob = await createZip(zipFiles).blob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "agent-personality.zip";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

// ─── URL Sharing ─────────────────────────────────────────────────

/**
 * Encode AgentDNA as a shareable URL with base64-encoded query param
 */
export function encodeShareableUrl(dna: AgentDNA): string {
  try {
    const json = JSON.stringify(dna);
    // Use encodeURIComponent to handle Unicode, then btoa for base64
    const encoded = btoa(encodeURIComponent(json));
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/wizard?dna=${encoded}`;
  } catch {
    return "";
  }
}

/**
 * Decode a shareable URL and extract the AgentDNA
 */
export function decodeShareableUrl(url: string): AgentDNA | null {
  try {
    const urlObj = new URL(url);
    const dnaParam = urlObj.searchParams.get("dna");
    if (!dnaParam) return null;

    // Decode base64 then URI component
    const json = decodeURIComponent(atob(dnaParam));
    const dna = JSON.parse(json) as AgentDNA;

    // Validate required fields
    if (!validateDnaStructure(dna)) return null;

    return dna;
  } catch {
    return null;
  }
}

// ─── JSON Export/Import ───────────────────────────────────────────

/**
 * Export AgentDNA as pretty-printed JSON string
 */
export function exportDnaJson(dna: AgentDNA): string {
  return JSON.stringify(dna, null, 2);
}

/**
 * Import AgentDNA from JSON string, with validation
 */
export function importDnaJson(json: string): AgentDNA | null {
  try {
    const parsed = JSON.parse(json) as AgentDNA;
    if (!validateDnaStructure(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ─── Validation ──────────────────────────────────────────────────

/**
 * Validate that an object has the required AgentDNA structure
 */
function validateDnaStructure(obj: unknown): obj is AgentDNA {
  if (!obj || typeof obj !== "object") return false;

  const dna = obj as Record<string, unknown>;

  // Check required top-level fields
  const requiredFields = [
    "temperament",
    "communication",
    "workStyle",
    "userRelationship",
    "domains",
    "primaryDomains",
  ];

  for (const field of requiredFields) {
    if (!(field in dna)) return false;
  }

  // Check archetype (can be null or string)
  if (dna.archetype !== null && typeof dna.archetype !== "string") return false;

  // Check temperament has required fields
  const temperament = dna.temperament as Record<string, unknown>;
  if (!temperament || typeof temperament !== "object") return false;
  const temperamentFields = ["valence", "energy", "warmth", "dominance", "stability", "autonomy"];
  for (const field of temperamentFields) {
    if (typeof temperament[field] !== "number") return false;
  }

  // Check communication has required fields
  const communication = dna.communication as Record<string, unknown>;
  if (!communication || typeof communication !== "object") return false;
  if (typeof communication.formality !== "number") return false;
  if (typeof communication.humor !== "number") return false;
  if (typeof communication.directness !== "number") return false;
  if (!["concise", "balanced", "thorough"].includes(communication.responseLength as string)) return false;
  if (!["prose", "mixed", "structured"].includes(communication.structurePreference as string)) return false;
  if (typeof communication.jargonLevel !== "number") return false;

  // Check workStyle
  const workStyle = dna.workStyle as Record<string, unknown>;
  if (!workStyle || typeof workStyle !== "object") return false;
  if (typeof workStyle.defaultDepth !== "number") return false;
  if (!["examples", "analogies", "first-principles", "mixed"].includes(workStyle.explanationStyle as string)) return false;
  if (!["minimal", "moderate", "heavy"].includes(workStyle.toolUsage as string)) return false;
  if (!["cautious", "balanced", "bold"].includes(workStyle.uncertaintyTolerance as string)) return false;

  // Check userRelationship
  const userRelationship = dna.userRelationship as Record<string, unknown>;
  if (!userRelationship || typeof userRelationship !== "object") return false;
  if (!["formal", "casual", "friendly"].includes(userRelationship.addressForm as string)) return false;
  if (!["gentle", "balanced", "direct"].includes(userRelationship.feedbackStyle as string)) return false;
  if (typeof userRelationship.proactivity !== "number") return false;
  if (typeof userRelationship.language !== "string") return false;

  // Check arrays
  if (!Array.isArray(dna.domains)) return false;
  if (!Array.isArray(dna.primaryDomains)) return false;

  return true;
}
