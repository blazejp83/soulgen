# SoulGen Architecture Research

Research date: 2026-02-05
Focus: Next.js App Router wizard app with LLM API proxy routes

---

## System Overview

```
+----------------------------------------------------------+
|                     BROWSER (Client)                      |
|                                                          |
|  +-------------------+  +-----------------------------+  |
|  |   Wizard Steps    |  |     Generation Pipeline     |  |
|  |                   |  |                             |  |
|  | 1. Archetype      |  |  DNA JSON  --> Prompt       |  |
|  | 2. Temperament    |  |  Prompt    --> API Route     |  |
|  | 3. Comm Style     |  |  Stream    --> Parse MD      |  |
|  | 4. Domains        |  |  Files     --> Preview/Edit  |  |
|  | 5. Summary        |  |  Export    --> ZIP Download   |  |
|  | 6. Generate       |  |                             |  |
|  | 7. Export         |  +-----------------------------+  |
|  +-------------------+                                   |
|           |                         |                    |
|    +------v-------------------------v-------+            |
|    |          Zustand Store                  |            |
|    |  wizardStore  | generationStore         |            |
|    |  settingsStore | i18nStore               |            |
|    +-------------------+---------------------+            |
|           |            |                                 |
|    +------v------+  +--v------------------+              |
|    | localStorage |  | React Components   |              |
|    | (persist)    |  | (UI / Forms)       |              |
|    +-------------+  +--------------------+               |
+----------------------------------------------------------+
           |  HTTP POST (user API key in body)
           v
+----------------------------------------------------------+
|              VERCEL SERVERLESS (API Routes)               |
|                                                          |
|  /api/generate          /api/models                      |
|  +------------------+   +------------------+             |
|  | Validate request |   | Fetch model list |             |
|  | Build LLM call   |   | (OpenRouter)     |             |
|  | Proxy to provider|   +------------------+             |
|  | Stream response  |                                    |
|  +------------------+                                    |
|           |                                              |
+----------------------------------------------------------+
           |  Authenticated API calls (key from request)
           v
+----------------------------------------------------------+
|              LLM PROVIDERS (External)                    |
|                                                          |
|  OpenAI API  |  Anthropic API  |  OpenRouter API         |
+----------------------------------------------------------+
```

---

## Component Responsibilities

| Component | Responsibility | Location |
|-----------|---------------|----------|
| **WizardShell** | Manages step navigation, progress bar, step validation gates | `src/components/wizard/WizardShell.tsx` |
| **Step Components** | Individual step UI (forms, sliders, card selection) | `src/components/wizard/steps/` |
| **WizardStore** | Current step, DNA state, step completion status, navigation logic | `src/stores/wizardStore.ts` |
| **GenerationStore** | Generated files, generation status, version history | `src/stores/generationStore.ts` |
| **SettingsStore** | API key, selected provider/model, UI language, theme | `src/stores/settingsStore.ts` |
| **PromptBuilder** | Constructs LLM prompts from DNA JSON + templates | `src/lib/prompts/` |
| **API Route: generate** | Receives DNA + API key, proxies to LLM provider, streams response | `src/app/api/generate/route.ts` |
| **API Route: models** | Fetches available models from OpenRouter | `src/app/api/models/route.ts` |
| **LLM Provider Adapter** | Normalizes request/response format across OpenAI, Anthropic, OpenRouter | `src/lib/llm/` |
| **ResponseParser** | Extracts SOUL.md, IDENTITY.md, USER.md from LLM response | `src/lib/parser.ts` |
| **FilePreview** | Tabbed markdown preview + edit for generated files | `src/components/preview/` |
| **ExportManager** | ZIP generation (JSZip), clipboard copy, OpenClaw config snippet | `src/lib/export.ts` |
| **i18n Dictionary** | Translation strings for EN/PL, dictionary provider for client components | `src/i18n/` |
| **DNA Schema** | Zod schema defining the complete DNA object shape and validation | `src/lib/schema.ts` |

---

## Recommended Project Structure

```
soulgen/
├── public/
│   └── locales/             # Static i18n JSON files (if needed)
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout: providers, fonts, i18n wrapper
│   │   ├── page.tsx             # Landing / start screen
│   │   ├── wizard/
│   │   │   ├── layout.tsx       # Wizard layout: progress bar, navigation shell
│   │   │   └── page.tsx         # Wizard page (single-page wizard, step rendered by state)
│   │   ├── settings/
│   │   │   └── page.tsx         # API key, provider, language settings
│   │   └── api/
│   │       ├── generate/
│   │       │   └── route.ts     # POST: proxy DNA -> LLM -> stream markdown response
│   │       └── models/
│   │           └── route.ts     # GET: fetch available models from OpenRouter
│   │
│   ├── components/
│   │   ├── ui/                  # Shared primitives (Button, Slider, Card, Badge, etc.)
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx      # Step container, progress, navigation
│   │   │   ├── StepNavigation.tsx   # Back/Next/Generate buttons
│   │   │   └── steps/
│   │   │       ├── ArchetypeStep.tsx
│   │   │       ├── TemperamentStep.tsx
│   │   │       ├── CommunicationStep.tsx
│   │   │       ├── DomainsStep.tsx
│   │   │       ├── SummaryStep.tsx
│   │   │       ├── GenerateStep.tsx
│   │   │       └── ExportStep.tsx
│   │   ├── preview/
│   │   │   ├── FilePreview.tsx      # Tabbed file viewer
│   │   │   ├── MarkdownEditor.tsx   # Edit mode with live preview
│   │   │   └── FileTab.tsx          # Individual file tab
│   │   └── settings/
│   │       ├── ApiKeyInput.tsx
│   │       ├── ProviderSelect.tsx
│   │       └── LanguageToggle.tsx
│   │
│   ├── stores/
│   │   ├── wizardStore.ts       # Wizard step state + DNA accumulation
│   │   ├── generationStore.ts   # Generated files, status, version history
│   │   └── settingsStore.ts     # API key, provider, model, language
│   │
│   ├── lib/
│   │   ├── llm/
│   │   │   ├── providers.ts     # Provider adapter: normalize OpenAI/Anthropic/OpenRouter
│   │   │   ├── streaming.ts     # Stream parsing utilities
│   │   │   └── types.ts         # LLM request/response type definitions
│   │   ├── prompts/
│   │   │   ├── builder.ts       # Construct full prompt from DNA
│   │   │   ├── templates.ts     # Prompt templates for SOUL/IDENTITY/USER
│   │   │   └── examples.ts      # Few-shot examples for generation quality
│   │   ├── schema.ts            # Zod schemas: DNA, wizard steps, API payloads
│   │   ├── parser.ts            # Parse LLM response into separate files
│   │   ├── export.ts            # ZIP generation, clipboard, OpenClaw config
│   │   └── constants.ts         # Archetypes, domains, presets, slider configs
│   │
│   ├── i18n/
│   │   ├── dictionaries/
│   │   │   ├── en.json
│   │   │   └── pl.json
│   │   ├── context.tsx          # DictionaryProvider + useDictionary hook
│   │   └── index.ts             # getDictionary helper, locale detection
│   │
│   ├── hooks/
│   │   ├── useWizardNavigation.ts   # Step validation + navigation logic
│   │   ├── useGeneration.ts         # Generation trigger, streaming, status
│   │   ├── useHydration.ts          # Zustand hydration gate for SSR safety
│   │   └── useExport.ts             # Export actions (ZIP, clipboard, config)
│   │
│   └── types/
│       ├── dna.ts               # DNA type definitions
│       ├── wizard.ts            # Wizard step types
│       └── generation.ts        # Generation result types
│
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

### Key Structural Decisions

**Single-page wizard (not route-per-step):**
The wizard lives at `/wizard` as one page. Steps are rendered conditionally based on Zustand state, not URL segments. This avoids route transitions, simplifies state management, and makes back/forward navigation trivial. The URL does not change between steps -- all state lives in the store.

Rationale: Route-per-step adds complexity (URL sync, layout transitions, state rehydration on refresh) with no real benefit for a 7-step linear wizard. The wizard is a single user flow, not separate pages.

**`src/` directory:**
All source code under `src/` keeps the root clean and is the standard Next.js App Router convention.

**Co-located API routes:**
API routes live under `src/app/api/` following App Router convention. Each route gets its own directory with a `route.ts` file.

**Feature-grouped components:**
Components are grouped by feature (`wizard/`, `preview/`, `settings/`) rather than by type (`buttons/`, `forms/`). This keeps related code together.

---

## Architectural Patterns

### 1. Zustand Store with localStorage Persistence

The central pattern for this app. Zustand with the `persist` middleware handles both state management and localStorage persistence in one layer.

```typescript
// src/stores/wizardStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DNA, WizardStep } from '@/types';

interface WizardState {
  currentStep: WizardStep;
  dna: Partial<DNA>;

  // Actions
  setStep: (step: WizardStep) => void;
  updateDNA: (patch: Partial<DNA>) => void;
  resetWizard: () => void;
}

const initialDNA: Partial<DNA> = {
  archetype: undefined,
  temperament: {
    valence: 50,
    energy: 50,
    warmth: 50,
    dominance: 50,
    stability: 50,
  },
  communication: {
    formality: 50,
    humor: 2,
    directness: 50,
    responseLength: 'medium',
    structure: 'mixed',
    jargonLevel: 50,
  },
  domains: [],
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 'archetype',
      dna: initialDNA,

      setStep: (step) => set({ currentStep: step }),
      updateDNA: (patch) =>
        set((state) => ({
          dna: { ...state.dna, ...patch },
        })),
      resetWizard: () =>
        set({ currentStep: 'archetype', dna: initialDNA }),
    }),
    {
      name: 'soulgen-wizard',
      // Only persist the DNA, not transient UI state
      partialize: (state) => ({
        dna: state.dna,
        currentStep: state.currentStep,
      }),
    }
  )
);
```

**Hydration safety pattern** -- critical for Next.js App Router to avoid SSR/client mismatch:

```typescript
// src/hooks/useHydration.ts
import { useEffect, useState } from 'react';

export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}

// Usage in components:
function WizardShell() {
  const hydrated = useHydration();
  const currentStep = useWizardStore((s) => s.currentStep);

  if (!hydrated) {
    return <WizardSkeleton />; // Show loading skeleton during hydration
  }

  return <StepRenderer step={currentStep} />;
}
```

### 2. API Route as LLM Proxy (Streaming)

The API route receives the user's API key in the request body, constructs the LLM call, and streams the response back. The key never appears in client-side network requests to external services.

```typescript
// src/app/api/generate/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Edge runtime for streaming
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { dna, apiKey, provider, model } = await request.json();

    // Validate inputs
    if (!apiKey || !dna || !provider || !model) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build the prompt from DNA
    const prompt = buildPrompt(dna);

    // Get provider-specific config
    const { url, headers, body } = buildProviderRequest({
      provider,
      model,
      apiKey,
      prompt,
    });

    // Forward to LLM provider
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Provider error: ${response.status}` },
        { status: response.status }
      );
    }

    // Stream the response back to the client
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Provider adapter pattern** -- normalizes across OpenAI, Anthropic, OpenRouter:

```typescript
// src/lib/llm/providers.ts
type Provider = 'openai' | 'anthropic' | 'openrouter';

interface ProviderConfig {
  url: string;
  headers: Record<string, string>;
  body: Record<string, unknown>;
}

export function buildProviderRequest(params: {
  provider: Provider;
  model: string;
  apiKey: string;
  prompt: string;
}): ProviderConfig {
  const { provider, model, apiKey, prompt } = params;

  const systemMessage = prompt;
  const userMessage = 'Generate the agent personality files based on the DNA provided in the system prompt.';

  switch (provider) {
    case 'openai':
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: {
          model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          stream: true,
        },
      };

    case 'anthropic':
      return {
        url: 'https://api.anthropic.com/v1/messages',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: {
          model,
          max_tokens: 4096,
          system: systemMessage,
          messages: [{ role: 'user', content: userMessage }],
          stream: true,
        },
      };

    case 'openrouter':
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://soulgen.vercel.app',
          'X-Title': 'SoulGen',
        },
        body: {
          model,
          messages: [
            { role: 'system', content: systemMessage },
            { role: 'user', content: userMessage },
          ],
          stream: true,
        },
      };
  }
}
```

### 3. Client-Side Stream Consumption

```typescript
// src/hooks/useGeneration.ts
import { useCallback, useRef } from 'react';
import { useGenerationStore } from '@/stores/generationStore';
import { useWizardStore } from '@/stores/wizardStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { buildPrompt } from '@/lib/prompts/builder';
import { parseGeneratedFiles } from '@/lib/parser';

export function useGeneration() {
  const abortRef = useRef<AbortController | null>(null);
  const dna = useWizardStore((s) => s.dna);
  const { apiKey, provider, model } = useSettingsStore((s) => ({
    apiKey: s.apiKey,
    provider: s.provider,
    model: s.model,
  }));
  const { setStatus, setStreamContent, setFiles, addToHistory } =
    useGenerationStore();

  const generate = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setStatus('generating');
    setStreamContent('');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dna, apiKey, provider, model }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += parseSSEChunk(chunk, provider);
        setStreamContent(accumulated);
      }

      // Parse the complete response into separate files
      const files = parseGeneratedFiles(accumulated);
      setFiles(files);
      addToHistory(files);
      setStatus('complete');
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        setStatus('error');
      }
    }
  }, [dna, apiKey, provider, model]);

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus('idle');
  }, []);

  return { generate, cancel };
}
```

### 4. Prompt Construction from DNA

```typescript
// src/lib/prompts/builder.ts
import type { DNA } from '@/types';
import { SOUL_TEMPLATE, IDENTITY_TEMPLATE, USER_TEMPLATE } from './templates';
import { FEW_SHOT_EXAMPLES } from './examples';

export function buildPrompt(dna: Partial<DNA>): string {
  const dnaDescription = describeDNA(dna);

  return `You are a personality file generator for AI agents.

Given the following agent DNA configuration, generate three markdown files:
1. SOUL.md - The agent's behavioral philosophy, core truths, boundaries, vibe, and continuity rules
2. IDENTITY.md - Structured metadata: name, creature type, vibe descriptor, emoji, avatar
3. USER.md - How the agent treats the user: communication preferences, language, relationship

## Agent DNA Configuration

${dnaDescription}

## Output Format

Respond with exactly three sections, separated by these delimiters:

---SOUL.md---
(content of SOUL.md here)

---IDENTITY.md---
(content of IDENTITY.md here)

---USER.md---
(content of USER.md here)

## Reference Examples

${FEW_SHOT_EXAMPLES}

## Template Structure

SOUL.md should follow this structure:
${SOUL_TEMPLATE}

IDENTITY.md should follow this structure:
${IDENTITY_TEMPLATE}

USER.md should follow this structure:
${USER_TEMPLATE}

Generate files that feel authentic and distinctive -- not generic. The personality
should come through in word choice, structure, and tone. Write in English.`;
}

function describeDNA(dna: Partial<DNA>): string {
  const sections: string[] = [];

  if (dna.archetype) {
    sections.push(`**Role Archetype:** ${dna.archetype}`);
  }

  if (dna.temperament) {
    const t = dna.temperament;
    sections.push(`**Temperament:**
- Valence (pessimistic 0 <-> 100 optimistic): ${t.valence}
- Energy (calm 0 <-> 100 energized): ${t.energy}
- Warmth (cold 0 <-> 100 empathetic): ${t.warmth}
- Dominance (gentle 0 <-> 100 assertive): ${t.dominance}
- Emotional Stability (reactive 0 <-> 100 stable): ${t.stability}`);
  }

  if (dna.communication) {
    const c = dna.communication;
    sections.push(`**Communication Style:**
- Formality (casual 0 <-> 100 formal): ${c.formality}
- Humor level: ${c.humor}/5
- Directness (diplomatic 0 <-> 100 blunt): ${c.directness}
- Response length: ${c.responseLength}
- Structure preference: ${c.structure}
- Jargon level (plain 0 <-> 100 technical): ${c.jargonLevel}`);
  }

  if (dna.domains?.length) {
    sections.push(`**Domains:** ${dna.domains.join(', ')}`);
  }

  return sections.join('\n\n');
}
```

### 5. Response Parser (LLM Output -> Separate Files)

```typescript
// src/lib/parser.ts

export interface GeneratedFiles {
  soul: string;
  identity: string;
  user: string | null;
}

const DELIMITERS = {
  soul: /---SOUL\.md---/,
  identity: /---IDENTITY\.md---/,
  user: /---USER\.md---/,
};

export function parseGeneratedFiles(raw: string): GeneratedFiles {
  const soulMatch = raw.split(DELIMITERS.soul)[1];
  const identityMatch = raw.split(DELIMITERS.identity)[1];
  const userMatch = raw.split(DELIMITERS.user)[1];

  // Each section ends where the next delimiter begins
  const soul = soulMatch
    ? soulMatch.split(DELIMITERS.identity)[0]?.trim() ?? ''
    : '';
  const identity = identityMatch
    ? identityMatch.split(DELIMITERS.user)[0]?.trim() ?? ''
    : '';
  const user = userMatch ? userMatch.trim() : null;

  return { soul, identity, user };
}
```

### 6. ZIP Export with JSZip

```typescript
// src/lib/export.ts
import JSZip from 'jszip';
import type { GeneratedFiles } from './parser';

export async function exportAsZip(
  files: GeneratedFiles,
  agentName: string
): Promise<Blob> {
  const zip = new JSZip();
  const folder = zip.folder(agentName) ?? zip;

  folder.file('SOUL.md', files.soul);
  folder.file('IDENTITY.md', files.identity);
  if (files.user) {
    folder.file('USER.md', files.user);
  }

  return zip.generateAsync({ type: 'blob' });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function generateOpenClawConfig(
  agentName: string,
  label: string
): string {
  const id = agentName.toLowerCase().replace(/\s+/g, '-');
  return JSON.stringify(
    {
      agents: {
        entries: {
          [id]: {
            label,
            repo: `/path/to/${id}`,
          },
        },
      },
    },
    null,
    2
  );
}
```

### 7. i18n Pattern (Simple Dictionary, No Locale Prefix)

Since this is a single-purpose tool (not a content site), use the simple dictionary pattern without locale URL prefixes. Language is stored in Zustand/localStorage and applied client-side.

```typescript
// src/i18n/dictionaries/en.json
{
  "wizard": {
    "steps": {
      "archetype": "Archetype",
      "temperament": "Temperament",
      "communication": "Communication Style",
      "domains": "Domains",
      "summary": "Summary",
      "generate": "Generate",
      "export": "Export"
    },
    "navigation": {
      "next": "Next",
      "back": "Back",
      "generate": "Generate Files",
      "regenerate": "Regenerate"
    }
  },
  "settings": {
    "apiKey": "API Key",
    "provider": "LLM Provider",
    "model": "Model",
    "language": "Language"
  }
}
```

```typescript
// src/i18n/context.tsx
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import en from './dictionaries/en.json';
import pl from './dictionaries/pl.json';
import { useSettingsStore } from '@/stores/settingsStore';

type Dictionary = typeof en;

const dictionaries: Record<string, Dictionary> = { en, pl };

const DictionaryContext = createContext<Dictionary>(en);

export function DictionaryProvider({ children }: { children: ReactNode }) {
  const language = useSettingsStore((s) => s.language);
  const dict = dictionaries[language] ?? en;

  return (
    <DictionaryContext.Provider value={dict}>
      {children}
    </DictionaryContext.Provider>
  );
}

export function useDictionary(): Dictionary {
  return useContext(DictionaryContext);
}

// Usage in components:
// const t = useDictionary();
// <button>{t.wizard.navigation.next}</button>
```

---

## Data Flow Diagrams

### Wizard Flow (Step Navigation + DNA Accumulation)

```
User lands on /wizard
        |
        v
+--[Archetype Step]--+  updateDNA({ archetype: 'developer' })
|  Select role card   |----> wizardStore.dna.archetype = 'developer'
+---------------------+
        | Next
        v
+--[Temperament Step]-+  updateDNA({ temperament: {...} })
|  Adjust sliders     |----> wizardStore.dna.temperament = { valence: 70, ... }
|  (or pick preset)   |
+---------------------+
        | Next
        v
+--[Communication]----+  updateDNA({ communication: {...} })
|  Set formality,     |----> wizardStore.dna.communication = { ... }
|  humor, directness  |
+---------------------+
        | Next
        v
+--[Domains Step]-----+  updateDNA({ domains: [...] })
|  Select tags,       |----> wizardStore.dna.domains = ['coding', 'research']
|  mark priorities    |
+---------------------+
        | Next
        v
+--[Summary Step]-----+
|  Review DNA JSON    |  <-- reads full wizardStore.dna
|  Advanced edit mode |  --> updateDNA(editedJSON)
+---------------------+
        | "Generate Files"
        v
+--[Generate Step]----+
|  Stream response    |  --> calls /api/generate
|  Show progress      |  --> generationStore.streamContent updates live
|  Parse into files   |  --> generationStore.files = { soul, identity, user }
+---------------------+
        | Complete
        v
+--[Export Step]------+
|  Preview tabs       |  <-- reads generationStore.files
|  Edit markdown      |  --> generationStore.files.soul = edited
|  Download ZIP       |  --> exportAsZip()
|  Copy to clipboard  |  --> copyToClipboard()
+---------------------+
```

### Generation Pipeline (DNA -> Files)

```
wizardStore.dna (Partial<DNA>)
        |
        v
buildPrompt(dna)                          [CLIENT: src/lib/prompts/builder.ts]
  - describeDNA() -> human-readable DNA description
  - inject into prompt template
  - attach few-shot examples
  - attach file structure templates
        |
        v
POST /api/generate                         [CLIENT -> SERVER]
  body: { dna, apiKey, provider, model }
        |
        v
route.ts handler                           [SERVER: src/app/api/generate/route.ts]
  - validate request body
  - buildProviderRequest(provider, model, apiKey, prompt)
  - fetch(providerURL, { stream: true })
        |
        v
LLM Provider API                           [EXTERNAL]
  - processes prompt
  - returns SSE stream
        |
        v
Stream passthrough                         [SERVER -> CLIENT]
  - Response body piped directly
  - Content-Type: text/event-stream
        |
        v
useGeneration() hook                       [CLIENT: src/hooks/useGeneration.ts]
  - ReadableStream reader
  - parseSSEChunk() per provider format
  - accumulate text in generationStore.streamContent
  - UI renders streaming text in real-time
        |
        v
parseGeneratedFiles(accumulated)           [CLIENT: src/lib/parser.ts]
  - split by ---SOUL.md--- / ---IDENTITY.md--- / ---USER.md---
  - extract and trim each section
        |
        v
generationStore.files = { soul, identity, user }
generationStore.history.push(files)        [CLIENT: Zustand store]
        |
        v
FilePreview renders tabs                   [CLIENT: src/components/preview/]
  - react-markdown for rendered view
  - textarea for edit mode
  - per-file regeneration button
```

### State Management Architecture

```
+--------------------------------------------------------------------+
|                        Zustand Stores                               |
|                                                                    |
|  wizardStore (persist -> localStorage 'soulgen-wizard')            |
|  +--------------------------+                                      |
|  | currentStep: WizardStep  |                                      |
|  | dna: Partial<DNA>        |  <-- accumulated across steps        |
|  | setStep()                |                                      |
|  | updateDNA()              |                                      |
|  | resetWizard()            |                                      |
|  +--------------------------+                                      |
|                                                                    |
|  generationStore (persist -> localStorage 'soulgen-generation')    |
|  +--------------------------+                                      |
|  | status: GenerationStatus |  idle | generating | complete | error|
|  | streamContent: string    |  <-- live streaming text             |
|  | files: GeneratedFiles    |  <-- parsed final files              |
|  | history: GeneratedFiles[]|  <-- version history for undo        |
|  | setStatus()              |                                      |
|  | setStreamContent()       |                                      |
|  | setFiles()               |                                      |
|  | addToHistory()           |                                      |
|  | restoreFromHistory(idx)  |                                      |
|  +--------------------------+                                      |
|                                                                    |
|  settingsStore (persist -> localStorage 'soulgen-settings')        |
|  +--------------------------+                                      |
|  | apiKey: string           |  <-- user's LLM API key              |
|  | provider: Provider       |  <-- openai | anthropic | openrouter |
|  | model: string            |  <-- selected model ID               |
|  | language: 'en' | 'pl'   |  <-- UI language                     |
|  | setApiKey()              |                                      |
|  | setProvider()            |                                      |
|  | setModel()               |                                      |
|  | setLanguage()            |                                      |
|  +--------------------------+                                      |
+--------------------------------------------------------------------+
         |                |                    |
         v                v                    v
   localStorage     React Components    DictionaryProvider
   (auto-sync)      (subscribed via     (reads language
                     selectors)          from settingsStore)
```

---

## Scaling Considerations

### What Scales Well With This Architecture

| Aspect | Why It Works |
|--------|-------------|
| **Adding wizard steps** | New step = new component + schema extension + store field. WizardShell renders by step key. |
| **Adding LLM providers** | New case in `buildProviderRequest()` switch. All providers normalized to same interface. |
| **Adding generated file types** | Extend parser delimiters, add tab in FilePreview, extend prompt template. |
| **Adding languages** | New JSON dictionary file + add to dictionaries map. No routing changes. |
| **Adding presets/archetypes** | Data-driven from `constants.ts`. No component changes needed. |

### What Needs Attention at Scale

| Aspect | Concern | Mitigation |
|--------|---------|------------|
| **localStorage limits** | ~5-10MB per origin. Version history can grow. | Cap history to last 5 versions. Prune old agent profiles. |
| **Vercel serverless cold starts** | Edge runtime minimizes this but first request may be slow. | Use Edge runtime for `/api/generate`. Keep handler lightweight. |
| **Prompt size** | Few-shot examples + templates can get large. | Monitor token usage. Make examples concise. Consider model-specific token limits. |
| **SSE timeout on Vercel** | Serverless functions have execution limits (free tier: 10s for serverless, 25s for Edge). | Use Edge runtime (longer timeout). Consider chunked non-streaming for very long generations. |
| **Bundle size** | JSZip (~45KB gzip), react-markdown, syntax highlighter can add up. | Dynamic imports for preview components. Tree-shake unused features. |

---

## Anti-Patterns to Avoid

### 1. Route-per-wizard-step
**Bad:** `/wizard/step-1`, `/wizard/step-2`, etc. with URL-based navigation.
**Why:** Adds routing complexity, requires URL<->state synchronization, breaks back button expectations, complicates state persistence, and provides no user benefit for a linear wizard.
**Do instead:** Single `/wizard` page with step rendered from store state.

### 2. Storing API keys in environment variables for user keys
**Bad:** Using `.env` to store user-provided API keys.
**Why:** These are per-user runtime values, not deployment config. Environment variables would be the same for all users.
**Do instead:** Store in localStorage (client-side), pass in request body to API route. API route uses the key for exactly one request, then discards it.

### 3. Building LLM calls on the client
**Bad:** Calling OpenAI/Anthropic APIs directly from browser JavaScript.
**Why:** Exposes API keys in browser network tab. CORS issues with some providers. No server-side validation.
**Do instead:** Always proxy through Next.js API routes. Client sends to `/api/generate`, server calls provider.

### 4. Monolithic Zustand store
**Bad:** One giant store with wizard state, generation state, settings, and UI state all together.
**Why:** Unnecessary re-renders, harder to reason about, persistence becomes all-or-nothing.
**Do instead:** Separate stores by concern (wizard, generation, settings). Each has its own localStorage key and `partialize` config.

### 5. Server Components for interactive wizard forms
**Bad:** Trying to make wizard steps Server Components.
**Why:** Wizard steps are inherently interactive (sliders, selections, form inputs). Server Components cannot use useState, useEffect, or event handlers.
**Do instead:** Mark wizard components as `'use client'`. Use Server Components only for static layouts and data fetching (like the landing page).

### 6. Over-engineering i18n with locale routing
**Bad:** Setting up `[locale]/` dynamic segments, middleware locale detection, and URL-based language switching for a 2-language tool app.
**Why:** Massive complexity for minimal benefit. This is a tool, not a content site. SEO for wizard pages is irrelevant.
**Do instead:** Simple dictionary context with language toggle. Store preference in Zustand. No URL changes.

### 7. Parsing LLM output with regex on partial streams
**Bad:** Trying to parse file delimiters on every stream chunk to show per-file progress.
**Why:** Delimiters can be split across chunks. Partial parsing is fragile and error-prone.
**Do instead:** Show the raw stream as-is during generation. Parse into separate files only after the stream completes.

### 8. Not handling Zustand hydration
**Bad:** Reading persisted store values directly in initial render without hydration gate.
**Why:** Server renders with default state, client hydrates with localStorage values, React throws hydration mismatch error.
**Do instead:** Use a `useHydration()` hook or show skeleton/loading state until client-side hydration completes.

---

## Integration Points

### External Services

| Service | Integration | Notes |
|---------|------------|-------|
| **OpenAI API** | `POST https://api.openai.com/v1/chat/completions` | Bearer token auth. SSE streaming. Models: gpt-4o, gpt-4o-mini, etc. |
| **Anthropic API** | `POST https://api.anthropic.com/v1/messages` | x-api-key header. SSE streaming. anthropic-version header required. Models: claude-sonnet-4-20250514, etc. |
| **OpenRouter API** | `POST https://openrouter.ai/api/v1/chat/completions` | OpenAI-compatible format. Bearer token. HTTP-Referer and X-Title headers recommended. Dynamic model list via GET `/api/v1/models`. |
| **Vercel** | Hosting + serverless Edge functions | Free tier: 100GB bandwidth, 10s serverless / 25s Edge timeout. |

### Internal Integration Map

```
Component A             -->  Component B              Via
-----------                  -----------              ---
ArchetypeStep           -->  wizardStore.dna          updateDNA({ archetype })
TemperamentStep         -->  wizardStore.dna          updateDNA({ temperament })
CommunicationStep       -->  wizardStore.dna          updateDNA({ communication })
DomainsStep             -->  wizardStore.dna          updateDNA({ domains })
SummaryStep             -->  wizardStore.dna          reads dna, can edit JSON directly
GenerateStep            -->  /api/generate            POST fetch with streaming
/api/generate           -->  LLM Provider             buildProviderRequest() + fetch
useGeneration hook      -->  generationStore          setStreamContent(), setFiles()
FilePreview             -->  generationStore.files    reads files for display
MarkdownEditor          -->  generationStore          updates individual file content
ExportStep              -->  export.ts                exportAsZip(), copyToClipboard()
LanguageToggle          -->  settingsStore            setLanguage()
DictionaryProvider      -->  settingsStore.language   reads language for dict selection
ApiKeyInput             -->  settingsStore            setApiKey()
ProviderSelect          -->  settingsStore            setProvider(), setModel()
All persisted stores    -->  localStorage             automatic via Zustand persist middleware
```

---

## Sources

### Next.js App Router Project Structure
- [Inside the App Router: Best Practices for Next.js File and Directory Structure (2025 Edition)](https://medium.com/better-dev-nextjs-react/inside-the-app-router-best-practices-for-next-js-file-and-directory-structure-2025-edition-ed6bc14a8da3) -- **HIGH** confidence
- [The Battle-Tested NextJS Project Structure (2025)](https://medium.com/@burpdeepak96/the-battle-tested-nextjs-project-structure-i-use-in-2025-f84c4eb5f426) -- **HIGH** confidence
- [Next.js Official: Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) -- **HIGH** confidence
- [Next.js Folder Structure Best Practices (2026 Guide)](https://www.codebydeep.com/blog/next-js-folder-structure-best-practices-for-scalable-applications-2026-guide) -- **MEDIUM** confidence
- [Next.js Official: Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers) -- **HIGH** confidence

### Multi-Step Wizard Patterns
- [React: Building a Multi-Step Form with Wizard Pattern](https://medium.com/@vandanpatel29122001/react-building-a-multi-step-form-with-wizard-pattern-85edec21f793) -- **HIGH** confidence
- [Build a Multistep Form with React Hook Form](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form) -- **HIGH** confidence
- [React Hook Form Multi-Step Tutorial: Zustand + Zod + Shadcn](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps) -- **HIGH** confidence
- [How To Build a Multi-Step Form using NextJS, TypeScript, React Context, And Shadcn UI](https://medium.com/@wdswy/how-to-build-a-multi-step-form-using-nextjs-typescript-react-context-and-shadcn-ui-ef1b7dcceec3) -- **MEDIUM** confidence

### LLM Streaming & API Proxy
- [Using SSE to stream LLM responses in Next.js (Upstash)](https://upstash.com/blog/sse-streaming-llm-responses) -- **HIGH** confidence
- [Vercel AI SDK: Getting Started with Next.js App Router](https://ai-sdk.dev/docs/getting-started/nextjs-app-router) -- **HIGH** confidence
- [Real-time AI in Next.js: How to stream responses with Vercel AI SDK](https://blog.logrocket.com/nextjs-vercel-ai-sdk-streaming/) -- **HIGH** confidence
- [Powerful Guide to Streaming LLM responses in Next.js with SSE](https://www.eaures.online/streaming-llm-responses-in-next-js) -- **MEDIUM** confidence
- [Setting Up Proxy API Routes in Next.js: The Definitive Guide](https://blog.nextsaaspilot.com/nextjs-proxy-api-route/) -- **HIGH** confidence
- [Next.js Route Handlers: The Complete Guide (MakerKit)](https://makerkit.dev/blog/tutorials/nextjs-api-best-practices) -- **HIGH** confidence

### State Management (Zustand)
- [Zustand Official: Persisting Store Data](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) -- **HIGH** confidence
- [How to use Zustand's persist middleware in Next.js](https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5) -- **HIGH** confidence
- [Working with Zustand (TkDodo)](https://tkdodo.eu/blog/working-with-zustand) -- **HIGH** confidence
- [Fix Next.js hydration error with Zustand state management](https://medium.com/@koalamango/fix-next-js-hydration-error-with-zustand-state-management-0ce51a0176ad) -- **HIGH** confidence
- [Zustand Official: SSR and Hydration](https://zustand.docs.pmnd.rs/guides/ssr-and-hydration) -- **HIGH** confidence
- [Multi-step Form Example using Zustand (react-hook-form Discussion)](https://github.com/orgs/react-hook-form/discussions/6382) -- **MEDIUM** confidence

### i18n
- [Next.js Official: Internationalization Guide](https://nextjs.org/docs/app/guides/internationalization) -- **HIGH** confidence
- [next-intl: App Router Setup](https://next-intl.dev/docs/getting-started/app-router) -- **HIGH** confidence
- [The Best i18n Libraries for Next.js App Router in 2025](https://medium.com/better-dev-nextjs-react/the-best-i18n-libraries-for-next-js-app-router-in-2025-21cb5ab2219a) -- **MEDIUM** confidence

### File Generation & Export
- [JSZip Official Documentation](https://stuk.github.io/jszip/) -- **HIGH** confidence
- [How to Generate ZIP with File Links in Next.js and React](https://www.mridul.tech/blogs/how-to-generate-zip-with-file-links-in-next-js-and-react-js) -- **MEDIUM** confidence

### LLM Proxy Architecture
- [Kaiban LLM Proxy (multi-provider proxy for OpenAI, Anthropic, Gemini)](https://github.com/kaiban-ai/kaiban-llm-proxy) -- **MEDIUM** confidence
- [LLM-API-Key-Proxy (multi-provider translation)](https://github.com/Mirrowel/LLM-API-Key-Proxy) -- **MEDIUM** confidence
- [Primer on AI Gateways / LLM Proxies](https://medium.com/@adnanmasood/primer-on-ai-gateways-llm-proxies-routers-definition-usage-and-purpose-9b714d544f8c) -- **MEDIUM** confidence

### Markdown Editing
- [@uiw/react-md-editor](https://uiwjs.github.io/react-md-editor/) -- **HIGH** confidence
- [5 Best Markdown Editors for React Compared (Strapi)](https://strapi.io/blog/top-5-markdown-editors-for-react) -- **MEDIUM** confidence
