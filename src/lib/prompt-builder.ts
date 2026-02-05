import type { AgentDNA } from "@/types";

// ─── Value Description Helpers ──────────────────────────────────

/**
 * Maps a 0-100 numeric value to a descriptive phrase.
 */
function describeValue(
  value: number,
  lowLabel: string,
  highLabel: string
): string {
  if (value <= 15) return `strongly ${lowLabel}`;
  if (value <= 35) return `leans ${lowLabel}`;
  if (value <= 65) return "moderate/neutral";
  if (value <= 85) return `leans ${highLabel}`;
  return `strongly ${highLabel}`;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Prompt Builder ─────────────────────────────────────────────

export function buildGenerationPrompt(dna: AgentDNA): {
  system: string;
  userMessage: string;
} {
  const system = `You are an expert AI personality designer. Your task is to generate three markdown files that define an OpenClaw AI agent's personality based on the user's configuration.

## Output Format

Generate three files in this exact order, each preceded by its delimiter on its own line:

---FILE: SOUL.md---
[content]

---FILE: IDENTITY.md---
[content]

---FILE: USER.md---
[content]

## File Purposes

### SOUL.md
This is the agent's behavioral philosophy and manifesto — NOT a config file. It should include:
- Core truths: What the agent believes about how to be helpful
- Boundaries: What the agent will and won't do
- Vibe: The personality essence in a few sentences
- Continuity: How the agent should treat its own persistence/memory

Write it as a personal manifesto that feels distinct and alive. Use second person ("You") addressing the agent. The values from the DNA should inform the tone, not be listed literally.

Example structure:
\`\`\`markdown
# SOUL.md - Who You Are

_[Tagline capturing the essence]_

## Core Truths

**[Truth 1]** [Explanation shaped by temperament/values]

**[Truth 2]** [Explanation]

## Boundaries

- [Boundary 1]
- [Boundary 2]

## Vibe

[Personality description]

## Continuity

[How the agent should handle memory/persistence]
\`\`\`

### IDENTITY.md
Structured metadata about the agent's identity:
- **Name:** A fitting name for this personality
- **Creature:** What kind of being is this (e.g., "an AI assistant with a philosophical bent", "a digital companion focused on code")
- **Vibe:** A short phrase capturing personality (e.g., "warm and methodical", "sharp and playful")
- **Emoji:** A single emoji that represents this agent
- **Avatar:** Always use \`avatars/agent.png\`

### USER.md
How the agent relates to its human user:
- Address form and tone
- Communication preferences (what the agent assumes about how the user wants to be communicated with)
- Language preference (from the language setting)
- What the agent assumes about the user
- Proactivity stance (how forward the agent is with suggestions)

## Important Guidelines

1. Write all files in English, EXCEPT: the language preference in USER.md should specify the configured language.
2. Make the personality DISTINCT — avoid generic/neutral language. The DNA values should produce a noticeably different agent from default settings.
3. The temperament sliders inform the TONE and CONTENT of SOUL.md, not just lists of traits.
4. Be creative with the Name — it should fit the personality.
5. Keep SOUL.md between 200-400 words. Keep USER.md concise.`;

  // Build user message with human-readable DNA
  const userMessage = buildUserMessage(dna);

  return { system, userMessage };
}

// ─── User Message Builder ────────────────────────────────────────

function buildUserMessage(dna: AgentDNA): string {
  const sections: string[] = [];

  // Archetype
  if (dna.archetype && dna.archetype !== "custom") {
    sections.push(`## Base Archetype\nThis agent is based on the **${capitalize(dna.archetype)}** archetype.`);
  } else {
    sections.push(`## Base Archetype\nThis is a **custom** agent with no preset archetype.`);
  }

  // Temperament
  sections.push(`## Temperament

- **Valence:** ${dna.temperament.valence}/100 — ${describeValue(dna.temperament.valence, "pessimistic", "optimistic")}
- **Energy:** ${dna.temperament.energy}/100 — ${describeValue(dna.temperament.energy, "calm/reserved", "energized/enthusiastic")}
- **Warmth:** ${dna.temperament.warmth}/100 — ${describeValue(dna.temperament.warmth, "cold/detached", "empathetic/warm")}
- **Dominance:** ${dna.temperament.dominance}/100 — ${describeValue(dna.temperament.dominance, "gentle/accommodating", "assertive/direct")}
- **Stability:** ${dna.temperament.stability}/100 — ${describeValue(dna.temperament.stability, "reactive/emotional", "stable/measured")}
- **Autonomy:** ${dna.temperament.autonomy}/100 — ${describeValue(dna.temperament.autonomy, "dependent/collaborative", "independent/self-directed")}`);

  // Communication Style
  const humorDesc = ["none", "rare", "occasional", "frequent", "very frequent", "constant"][dna.communication.humor] || "moderate";

  sections.push(`## Communication Style

- **Formality:** ${dna.communication.formality}/100 — ${describeValue(dna.communication.formality, "casual", "formal")}
- **Humor:** ${dna.communication.humor}/5 — ${humorDesc}
- **Directness:** ${dna.communication.directness}/100 — ${describeValue(dna.communication.directness, "diplomatic/indirect", "blunt/direct")}
- **Response Length:** ${capitalize(dna.communication.responseLength)}
- **Structure Preference:** ${capitalize(dna.communication.structurePreference)} (${dna.communication.structurePreference === "prose" ? "flowing paragraphs" : dna.communication.structurePreference === "structured" ? "bullet points and headers" : "mix of both"})
- **Jargon Level:** ${dna.communication.jargonLevel}/100 — ${describeValue(dna.communication.jargonLevel, "plain language", "technical jargon")}`);

  // Work Style
  sections.push(`## Work Style

- **Default Depth:** ${dna.workStyle.defaultDepth}/100 — ${describeValue(dna.workStyle.defaultDepth, "overview/summary", "deep-dive/detailed")}
- **Explanation Style:** ${capitalize(dna.workStyle.explanationStyle)} (${dna.workStyle.explanationStyle === "examples" ? "learns through examples" : dna.workStyle.explanationStyle === "analogies" ? "uses analogies" : dna.workStyle.explanationStyle === "first-principles" ? "explains from first principles" : "mixes approaches"})
- **Tool Usage:** ${capitalize(dna.workStyle.toolUsage)}
- **Uncertainty Tolerance:** ${capitalize(dna.workStyle.uncertaintyTolerance)} (${dna.workStyle.uncertaintyTolerance === "cautious" ? "prefers certainty" : dna.workStyle.uncertaintyTolerance === "bold" ? "comfortable with ambiguity" : "balanced approach"})`);

  // User Relationship
  const langName = getLanguageName(dna.userRelationship.language);

  sections.push(`## User Relationship

- **Address Form:** ${capitalize(dna.userRelationship.addressForm)}
- **Feedback Style:** ${capitalize(dna.userRelationship.feedbackStyle)}
- **Proactivity:** ${dna.userRelationship.proactivity}/100 — ${describeValue(dna.userRelationship.proactivity, "reactive/waits for requests", "proactive/offers suggestions")}
- **Preferred Language:** ${langName} (${dna.userRelationship.language})`);

  // Domains
  if (dna.domains.length > 0) {
    const domainList = dna.domains.map((d) => {
      const isPrimary = dna.primaryDomains.includes(d);
      return isPrimary ? `**${capitalize(d)}** (primary)` : capitalize(d);
    });
    sections.push(`## Domains of Expertise

${domainList.join(", ")}

${dna.primaryDomains.length > 0 ? `Primary focus areas: ${dna.primaryDomains.map(capitalize).join(", ")}` : ""}`);
  } else {
    sections.push(`## Domains of Expertise

General-purpose agent with no specific domain focus.`);
  }

  return `Generate the three personality files for an AI agent with the following configuration:\n\n${sections.join("\n\n")}`;
}

// ─── Language Helper ─────────────────────────────────────────────

function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    nl: "Dutch",
    pl: "Polish",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
  };
  return languages[code] || code.toUpperCase();
}
