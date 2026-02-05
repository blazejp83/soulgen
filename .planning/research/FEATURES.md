# SoulGen Feature Research

Research into AI agent/persona configurator tools, character creator UX patterns, and wizard UI best practices. Focused on what is relevant for a **personality file generator** (not an agent runtime) that outputs SOUL.md, IDENTITY.md, and USER.md files.

---

## Table Stakes (Users Expect These)

These features are baseline expectations. Shipping without them feels broken or incomplete.

### 1. Multi-Step Wizard Flow with Progress Indicator
Every major personality configurator uses a stepped flow: ChatGPT GPT Builder uses a conversational wizard, Character.AI has a sequential editor, Poe has a setup page with sections. Users expect to see where they are in the process (step numbers, labels, percentage complete) and to navigate back to previous steps without losing data.

**Specific UX patterns:**
- Step labels visible at all times (not just numbers -- "Archetype", "Temperament", etc.)
- Ability to jump back to any completed step
- Visual progress bar or stepper with completed/current/upcoming states
- "Next" and "Back" buttons with keyboard shortcut support

*Confidence: HIGH -- Universally present in multi-step configuration tools. PatternFly, MUI, and CoreUI stepper components all follow this pattern. [Eleken wizard UI pattern guide](https://www.eleken.co/blog-posts/wizard-ui-pattern-explained), [Webstacks multi-step form examples](https://www.webstacks.com/blog/multi-step-form)*

### 2. Archetype/Role Selection as Entry Point
Character.AI, Poe, Inworld AI, and RPG character creators all start with a broad role or class selection before drilling into specifics. This anchors the user's mental model and reduces decision paralysis on subsequent steps.

**Specific UX patterns:**
- Card-based selection grid (not a dropdown)
- Each card has: icon/illustration, name, 1-2 sentence description, tags
- Single selection (radio behavior, not multi-select)
- Visual highlight on selected card
- Optional "Custom / Start from scratch" card for advanced users

*Confidence: HIGH -- Present in Character.AI, Poe, Inworld, every RPG character creator, ElizaOS templates. [Algoryte RPG character creation guide](https://www.algoryte.com/news/rpg-character-creation-designing-your-custom-hero/)*

### 3. Personality/Temperament Sliders with Labeled Endpoints
Inworld AI uses 10 personality sliders. RPG games (Black Desert, Disco Elysium) use slider-based trait configuration extensively. The OCEAN/Big Five model provides scientific grounding for personality dimensions.

**Specific UX patterns:**
- Bipolar sliders with labeled endpoints (e.g., "Pessimistic <-> Optimistic")
- Center-default for neutral values
- Numeric readout or descriptive label at current position
- Grouped into logical sections (Emotional, Social, Cognitive)
- 5-7 sliders is the sweet spot; more than 10 causes slider fatigue

*Confidence: HIGH -- Inworld AI, RPG character creators, OCEAN model. [Inworld personality docs](https://docs.inworld.ai/docs/tutorial-basics/personality-emotion/), [Big Five Wikipedia](https://en.wikipedia.org/wiki/Big_Five_personality_traits)*

### 4. Presets/Templates That Pre-Fill Configuration
Every tool offers starting points. Character.AI has templates, Poe has base model selection, ChatGPT GPT Builder offers example GPTs, ElizaOS has minimal character examples, SillyTavern has community character cards. Users expect "quick start" paths that set reasonable defaults.

**Specific UX patterns:**
- Temperament presets (e.g., "Melancholic", "Joyful", "Stoic") that set slider values
- Clicking a preset fills values but allows manual tweaking afterward
- Clear visual distinction between "preset active" and "custom values"
- Presets should feel like suggestions, not constraints

*Confidence: HIGH -- Present in every tool surveyed. [ElizaOS characterfile repo](https://github.com/elizaOS/characterfile), [SillyTavern character design docs](https://docs.sillytavern.app/usage/core-concepts/characterdesign/)*

### 5. Summary/Review Step Before Generation
All wizard patterns include a confirmation step. Users need to see the complete picture before committing to an action (especially one that costs API credits).

**Specific UX patterns:**
- Readable natural-language summary (not just raw JSON)
- Organized by section (matching wizard steps)
- "Edit" links next to each section to jump back
- Total configuration visible on one screen
- Estimated API cost indicator (token count estimate)

*Confidence: HIGH -- Standard wizard UX pattern. [Andrew Coyle form wizard design](https://coyleandrew.medium.com/how-to-design-a-form-wizard-b85fe1cc665a)*

### 6. File Preview with Tabs
SillyTavern shows character card fields in tabs. ChatGPT GPT Builder shows a live preview pane. Users expect to see what they are getting before downloading.

**Specific UX patterns:**
- Tab bar: SOUL.md | IDENTITY.md | USER.md
- Markdown rendering (not raw text) as default view
- Toggle between rendered and raw markdown
- Syntax highlighting in raw mode
- Copy-to-clipboard button per tab

*Confidence: HIGH -- Standard for any code/file generation tool.*

### 7. Export as Downloadable Files
SillyTavern exports PNG+JSON character cards. ElizaOS exports JSON character files. ChatGPT GPT Builder allows copying instructions. Users expect to get their output as files they can use immediately.

**Specific UX patterns:**
- ZIP download containing all generated files
- Individual file download per tab
- Copy-to-clipboard per file
- Filename follows convention (agent-name/SOUL.md, etc.)

*Confidence: HIGH -- Every file generator provides this.*

### 8. localStorage Persistence (Auto-Save)
Multi-step forms that lose state on refresh are unacceptable. Users expect their progress to survive page refreshes and browser closes.

**Specific UX patterns:**
- Auto-save on every step change (not just on blur)
- Restore state on page load with visual indicator ("Resuming your previous session")
- Explicit "Start Over" / "Clear" action
- Save multiple agent profiles locally
- Version state schema for forward compatibility

*Confidence: HIGH -- [Andy Fry multi-step persistent state](https://andyfry.co/multi-step-form-persistent-state/), [Zustand persist middleware pattern](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)*

### 9. API Key Management (BYO Key)
Poe allows BYO API key. OpenRouter and similar tools normalize multi-provider key management. Users providing their own keys expect clear provider selection, model selection, and key validation.

**Specific UX patterns:**
- Provider selector (OpenAI, Anthropic, OpenRouter)
- API key input with show/hide toggle
- "Test connection" button with success/failure feedback
- Model dropdown populated after successful key validation
- Key stored in localStorage (with appropriate warnings)
- Clear messaging: "Your key is stored locally, never sent to our servers"

*Confidence: HIGH -- Standard for BYO-key tools. [Chub.ai multi-LLM support](https://www.charhubai.com/)*

### 10. Simple vs. Advanced Mode Toggle
ChatGPT GPT Builder has a "Create" tab (conversational) and a "Configure" tab (manual). Poe has basic and advanced bot settings. The agent-persona-generator spec explicitly calls for this.

**Specific UX patterns:**
- Toggle/switch in header: "Simple" | "Advanced"
- Simple mode: ~5-6 key parameters (role, formality, humor, directness, length, domains)
- Advanced mode: all parameters visible including temperament sliders, work style, relationship settings
- Mode persists across sessions
- Switching to Simple doesn't delete Advanced values (they stay in background)

*Confidence: HIGH -- Explicitly in spec, common pattern across tools.*

---

## Differentiators (Competitive Advantage)

These features would set SoulGen apart from general-purpose character creators and GPT builders.

### 1. OpenClaw-Native Output Format
No other tool generates SOUL.md / IDENTITY.md / USER.md files. This is purpose-built for the OpenClaw ecosystem with its specific format requirements (manifesto-style SOUL.md, structured IDENTITY.md metadata, USER.md preferences).

**Why it differentiates:** Generic tools output system prompts or JSON configs. SoulGen outputs philosophy-as-markdown, which is fundamentally different from "You are a helpful assistant that..." instructions.

**Implementation specifics:**
- Output matches exact OpenClaw file conventions (SOUL.md sections: Core Truths, Boundaries, Vibe, Continuity)
- IDENTITY.md follows the typed schema (name, emoji, theme, creature, vibe, avatar)
- USER.md covers communication preferences, language, relationship style
- Include OpenClaw config snippets for `openclaw.json` agent entries

*Confidence: HIGH -- Unique to this project by definition.*

### 2. DNA-as-Data Architecture (JSON Intermediate Representation)
The "DNA payload" concept is the key architectural differentiator. Rather than going directly from form to prompt, SoulGen creates a structured JSON intermediate that can be:
- Exported/imported as JSON
- Shared via URL (base64-encoded in query params)
- Versioned and diffed
- Used as input for regeneration with different models
- Edited directly by power users

**Why it differentiates:** Character.AI and GPT Builder don't expose their intermediate representation. SillyTavern cards are output-only. Having an editable DNA layer between UI and generation is unique.

**Implementation specifics:**
- JSON schema for DNA with all personality dimensions
- Advanced edit mode with JSON editor
- Import DNA from file or paste
- Export DNA separately from generated files
- Shareable URLs: `soulgen.app/?dna=base64encodedJSON`

*Confidence: HIGH -- Explicitly designed into the spec. [json-url compression library](https://github.com/masotime/json-url) for URL sharing.*

### 3. Per-Section Regeneration with Context
Most tools regenerate everything or nothing. SoulGen can regenerate individual files or sections while keeping the rest intact.

**Why it differentiates:** If SOUL.md is perfect but IDENTITY.md needs work, users shouldn't have to regenerate everything. This saves API credits and preserves manual edits.

**Implementation specifics:**
- "Regenerate this section" button per tab
- "Regenerate this paragraph" for finer control (v2+)
- Session-local version history per file (undo/redo stack)
- Diff view between versions

*Confidence: MEDIUM -- Technically straightforward but not seen in competing tools.*

### 4. Live Personality Summary (Natural Language Preview)
As users adjust sliders and settings, a real-time natural language summary updates to describe the personality in plain English. This bridges the gap between abstract slider values and concrete behavior.

**Why it differentiates:** Inworld has sliders but no live summary. GPT Builder has conversational creation but no slider-to-description bridge. The spec calls for this ("mini-summary generated from settings").

**Implementation specifics:**
- Client-side template-based summary (no LLM call) for instant feedback
- Format: "A [calm/energetic], [formal/casual] [role] who communicates [directly/diplomatically] with [no/moderate/frequent] humor."
- Updates in real-time as sliders change
- More detailed LLM-generated summary available on-demand

*Confidence: MEDIUM -- Not common in existing tools. Adds significant UX value for bridging slider-to-behavior gap.*

### 5. Agent Chat Preview (Test Your Personality)
After generating files, a mini chat interface lets users test the personality by sending messages and seeing responses generated with SOUL.md + IDENTITY.md as the system prompt.

**Why it differentiates:** Character.AI and Poe are chat-first. But for a file generator, having a test chat is a unique validation step. It lets users verify the generated files produce the intended behavior before exporting.

**Implementation specifics:**
- Simple chat UI with message input and response display
- Uses the generated SOUL.md + IDENTITY.md as system prompt
- Same API key and model as generation
- Clear labeling: "This is a preview -- the agent will behave similarly in OpenClaw"
- 3-5 suggested test prompts based on the agent's domains

*Confidence: MEDIUM -- Explicitly called out as "nice-to-have" in spec. [Talkie AI testing console](https://www.talkie-ai.com/)*

### 6. Community Presets via GitHub (No Backend Needed)
Without user accounts, community sharing can work through a public GitHub repository of DNA presets. Users can submit presets via PR, and the app fetches the preset gallery from the repo.

**Why it differentiates:** Achieves community sharing without a backend. SillyTavern character cards work similarly via community sites like chub.ai, but SoulGen can own its preset gallery through GitHub.

**Implementation specifics:**
- GitHub repo: `openclaw/soulgen-presets` with JSON DNA files
- App fetches preset index at load time (cached in localStorage)
- "Browse Community Presets" gallery in the app
- "Export as Preset" generates a formatted JSON for PR submission
- Instructions for contributing via GitHub PR

*Confidence: MEDIUM -- Novel approach for no-backend community features. Requires community adoption.*

---

## Anti-Features (Commonly Requested, Often Problematic)

Features that seem valuable but introduce complexity, confusion, or maintenance burden disproportionate to their benefit.

### 1. Granular Personality Sliders (More Than 7-10)
**Why it's requested:** "More sliders = more control" intuition.
**Why it's problematic:** Research shows slider values have a weak, inconsistent mapping to actual LLM behavior. At extreme values, models shift into theatrical/mystical speaking styles regardless of the setting. More sliders create an illusion of precision that the underlying LLM cannot deliver. Slider fatigue causes users to leave values at defaults.
**Recommendation:** Cap at 5 temperament sliders + 6 communication style settings. Use presets to handle combinations that individual sliders can't express.

*Sources: [Anthropic persona vectors research](https://www.anthropic.com/research/persona-vectors), [Inworld personality docs](https://docs.inworld.ai/docs/tutorial-basics/personality-emotion/), [HuggyMonkey chatbot persona design](https://medium.com/@HuggyMonkey/chatbots-persona-part-4-personality-traits-and-design-12425c9fb0dd)*

### 2. Free-Form "Describe Your Agent" Text Box as Primary Input
**Why it's requested:** "Just let me describe what I want in natural language."
**Why it's problematic:** Produces inconsistent DNA. Users don't know what to write. The structured wizard exists precisely to guide users through dimensions they wouldn't think of. Free-form text works for ChatGPT GPT Builder because it has a conversational AI parsing the input; a static form can't match that.
**Recommendation:** Keep as an optional Advanced feature (paste existing SOUL.md to reverse-engineer DNA), not as the primary creation path.

### 3. User Account System / Cloud Sync
**Why it's requested:** "I want to access my agents from any device."
**Why it's problematic:** Requires backend infrastructure, auth, database, GDPR compliance, ongoing costs. Violates the core constraint of zero backend. localStorage + JSON export/import + URL sharing covers 90% of the use case.
**Recommendation:** Stay with localStorage. Offer JSON export/import and shareable URLs as the "sync" mechanism.

### 4. Real-Time LLM-Powered Slider Descriptions
**Why it's requested:** "Show me exactly how the agent will behave as I move each slider."
**Why it's problematic:** Makes an API call on every slider change. Expensive, slow, and creates a dependency on having a valid API key before the user has even finished configuration. The summary would lag behind slider movements.
**Recommendation:** Use client-side template strings for instant slider descriptions. Offer an optional "Generate detailed preview" button that makes a single LLM call with the complete DNA.

### 5. Visual Avatar Generation
**Why it's requested:** "Generate an image for my agent."
**Why it's problematic:** Requires image generation API (DALL-E, Midjourney). Different billing, different API keys, different error handling. IDENTITY.md already has an avatar field that accepts a path or URL -- users can bring their own image.
**Recommendation:** Out of scope for v1. Allow avatar URL field in IDENTITY.md. Consider as v2+ feature.

### 6. Agent-to-Agent Conversation Simulation
**Why it's requested:** "Let me see how two agents would interact."
**Why it's problematic:** Doubles API costs, requires managing two system prompts simultaneously, complex UI for message threading. Goes beyond the scope of a file generator.
**Recommendation:** Out of scope entirely. Single-agent chat preview is sufficient.

### 7. Sycophancy Slider / "Agreeableness" Control
**Why it's requested:** "I want my agent to be more/less agreeable."
**Why it's problematic:** Research shows overly agreeable AI personalities erode user agency, increase dependence, and deepen parasocial bonds. Combined with memory features, this becomes actively harmful. The line between "friendly" and "sycophantic" is difficult to calibrate via a slider.
**Recommendation:** Handle through the warmth and directness sliders indirectly. In SOUL.md generation, include anti-sycophancy language by default ("Have opinions. You're allowed to disagree.").

*Sources: [ShapeofAI personality patterns](https://www.shapeof.ai/patterns/personality), [Anthropic building effective agents](https://www.anthropic.com/research/building-effective-agents)*

### 8. Undo/Redo Across the Entire Wizard
**Why it's requested:** "Let me undo my last change across any step."
**Why it's problematic:** Global undo across multi-step wizards is architecturally complex. Which state is the user undoing -- a slider change, a step navigation, a preset selection? State management becomes a branching tree rather than a linear history.
**Recommendation:** Per-step state snapshots (save state when entering/leaving a step). Per-file version history after generation. Not a global undo stack.

---

## Feature Dependencies Diagram

```
[API Key Setup] ─────────────────────────────────────────┐
       │                                                  │
       v                                                  v
[Archetype Selection] ──> [Temperament Sliders] ──> [Communication Style]
       │                         │                        │
       │                    [Presets]                      │
       │                         │                        │
       v                         v                        v
[Domain Selection] ──────> [DNA Summary] ──────> [LLM Generation]
                                │                        │
                           [JSON Export]                  │
                           [URL Share]                    v
                                                  [File Preview]
                                                      │    │
                                                      │    v
                                                      │  [Per-Section Regen]
                                                      │    │
                                                      v    v
                                               [File Export (ZIP)]
                                                      │
                                                      v
                                               [Agent Chat Preview]
                                               (requires generated files)
```

### Critical Path (Blocks Everything)
```
API Key → LLM Generation → File Preview → Export
```

### Independent Tracks (Can Be Built in Parallel)
```
Track A: Wizard Steps (Archetype → Temperament → Communication → Domains → Summary)
Track B: API Key Management + LLM Integration
Track C: File Preview + Export Mechanics
Track D: localStorage Persistence Layer
```

---

## MVP Definition

### v1.0 -- Core Generator (Ship to Validate)

**Goal:** Users can create an agent personality and get usable SOUL.md, IDENTITY.md, and USER.md files.

| Feature | Priority | Effort |
|---------|----------|--------|
| Multi-step wizard (5 steps + summary) | P0 | M |
| Archetype card selection (7 archetypes) | P0 | S |
| Temperament sliders (5 sliders) | P0 | S |
| Temperament presets (4 presets) | P0 | S |
| Communication style settings (6 params) | P0 | M |
| Domain multi-select with priority | P0 | S |
| DNA summary view (readable) | P0 | S |
| API key entry + provider selection | P0 | M |
| LLM generation (DNA to files) | P0 | L |
| File preview with tabs (SOUL/IDENTITY/USER) | P0 | M |
| Export: ZIP download + copy-to-clipboard | P0 | M |
| localStorage auto-save (wizard state) | P0 | M |
| Simple/Advanced mode toggle | P1 | S |
| Basic validation + error handling | P0 | M |
| English UI (i18n deferred) | -- | -- |

**Total: ~4-6 focused implementation sessions**

### v1.x -- Polish and Power Users

| Feature | Priority | Effort |
|---------|----------|--------|
| Per-section regeneration | P1 | M |
| Session-local version history per file | P1 | M |
| Import existing DNA (JSON paste/upload) | P1 | S |
| Advanced JSON edit mode in summary | P1 | M |
| Shareable URL (base64 DNA in query param) | P1 | S |
| Live personality summary (template-based) | P1 | M |
| OpenClaw config snippet export | P1 | S |
| Polish language UI (i18n) | P2 | M |
| Save multiple agent profiles in localStorage | P2 | M |
| Work style settings (depth, explanation, tools, uncertainty) | P1 | S |
| User relationship settings (address, feedback, proactivity) | P1 | S |
| Markdown rendering toggle in preview | P2 | S |
| Agent response language setting (in USER.md) | P1 | S |

### v2+ -- Community and Advanced

| Feature | Priority | Effort |
|---------|----------|--------|
| Agent chat preview (test personality) | P2 | L |
| Community preset gallery (GitHub-backed) | P2 | L |
| Clone/fork existing agent profiles | P2 | M |
| Diff view between file versions | P3 | M |
| Per-paragraph regeneration | P3 | L |
| Visual avatar URL preview | P3 | S |
| ElizaOS character file export format | P3 | M |
| SillyTavern character card export format | P3 | M |
| Custom archetype creation | P3 | M |
| Token cost estimation before generation | P3 | S |
| Keyboard shortcuts throughout wizard | P3 | S |

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Effort | Risk | Priority Score |
|---------|-----------|----------------------|------|---------------|
| Wizard flow + steps | Critical | Medium | Low | **P0** |
| Archetype selection | High | Small | Low | **P0** |
| Temperament sliders | High | Small | Low | **P0** |
| Temperament presets | High | Small | Low | **P0** |
| Communication style | High | Medium | Low | **P0** |
| Domain selection | High | Small | Low | **P0** |
| LLM generation | Critical | Large | Medium | **P0** |
| File preview + tabs | Critical | Medium | Low | **P0** |
| Export (ZIP + clipboard) | Critical | Medium | Low | **P0** |
| API key management | Critical | Medium | Low | **P0** |
| localStorage persistence | High | Medium | Low | **P0** |
| Simple/Advanced toggle | Medium | Small | Low | **P1** |
| Per-section regen | High | Medium | Low | **P1** |
| Import existing DNA | Medium | Small | Low | **P1** |
| Shareable URL | Medium | Small | Low | **P1** |
| Live personality summary | Medium | Medium | Low | **P1** |
| i18n (EN/PL) | Medium | Medium | Low | **P2** |
| Multiple profiles | Medium | Medium | Low | **P2** |
| Chat preview | High | Large | Medium | **P2** |
| Community presets | Medium | Large | Medium | **P2** |
| Alternative export formats | Low | Medium | Low | **P3** |

**Scoring method:** User Value (Critical/High/Medium/Low) x Effort inverse (S > M > L) x Risk inverse (Low > Medium > High)

---

## Competitor Feature Analysis

### Character.AI Character Creator
| Feature | Present | Notes |
|---------|---------|-------|
| Character name + description | Yes | Basic text fields |
| Personality definition | Yes | Free-text description |
| Greeting/first message | Yes | Defines conversation opening |
| Avatar/image | Yes | Upload or generate |
| Voice selection | Yes | Choose character voice |
| Category/tags | Yes | For discoverability |
| Visibility (public/private) | Yes | Sharing control |
| Template-based creation | Partial | Via existing characters |
| Slider-based personality | No | Free-text only |
| File export | No | Platform-locked |
| API key BYO | No | Platform-provided model |
| **Relevance to SoulGen** | Low | Different paradigm (chat platform vs file generator) |

### ChatGPT GPT Builder
| Feature | Present | Notes |
|---------|---------|-------|
| Conversational creation wizard | Yes | AI guides the process |
| Manual configuration tab | Yes | Instructions, knowledge, capabilities |
| Name + description | Yes | Basic metadata |
| System instructions | Yes | Free-text prompt |
| Prompt starters | Yes | Example conversation openers |
| Knowledge upload | Yes | PDF/document upload |
| Capabilities toggle | Yes | Web search, DALL-E, code interpreter |
| Custom actions (API) | Yes | OpenAPI schema integration |
| Live preview chat | Yes | Side-by-side with editor |
| File export | No | Platform-locked |
| Slider-based personality | No | Free-text instructions |
| **Relevance to SoulGen** | Medium | Live preview pattern is valuable; conversational wizard is out of scope |

### Poe Bot Creator
| Feature | Present | Notes |
|---------|---------|-------|
| Bot name + handle | Yes | Unique identifier |
| Foundational instruction | Yes | System prompt (free-text) |
| Base model selection | Yes | GPT-4, Claude, etc. |
| Intro message | Yes | First message greeting |
| Knowledge base upload | Yes | PDF/documents |
| Custom tone/language | Yes | Via instructions |
| Profile image | Yes | Upload avatar |
| API key BYO | Yes | Connect own keys |
| File export | No | Platform-locked |
| Slider-based personality | No | Free-text instructions |
| **Relevance to SoulGen** | Medium | BYO key pattern is relevant; otherwise platform-locked |

### SillyTavern + Chub.ai
| Feature | Present | Notes |
|---------|---------|-------|
| Character card format (V2) | Yes | PNG with embedded JSON |
| Name, description, personality | Yes | Structured fields |
| First message + alternatives | Yes | Multiple greeting options |
| Message examples | Yes | Few-shot examples |
| Scenario/world info | Yes | Context definition |
| Lorebooks | Yes | Extended knowledge |
| Tags/categorization | Yes | For browsing |
| Community sharing (Chub) | Yes | Public gallery with ratings |
| Import/export (PNG/JSON) | Yes | Cross-platform compatible |
| Multiple API backends | Yes | BYO key, model selection |
| Slider-based personality | No | Free-text definitions |
| **Relevance to SoulGen** | HIGH | Closest analog. Community sharing model, BYO key, export format, character card structure |

### ElizaOS Character Files
| Feature | Present | Notes |
|---------|---------|-------|
| JSON character format | Yes | Structured schema |
| Name, bio, lore | Yes | Identity basics |
| Style configuration | Yes | All/chat/post style rules |
| Knowledge/RAG | Yes | Embedded knowledge |
| Message examples | Yes | Few-shot patterns |
| Topics list | Yes | Domain specification |
| Adjectives list | Yes | Personality descriptors |
| Plugin configuration | Yes | Capabilities |
| Model provider selection | Yes | Multi-model support |
| Bio randomization | Yes | Chunked bio for variation |
| File export | Yes | JSON file |
| Visual creation wizard | No | Manual JSON editing or third-party tools |
| **Relevance to SoulGen** | HIGH | Output format is a direct comparison. SoulGen's wizard fills the "visual creation" gap that ElizaOS lacks |

### Inworld AI Character Studio
| Feature | Present | Notes |
|---------|---------|-------|
| Personality sliders (10) | Yes | Mood + personality dimensions |
| Core description | Yes | Character backstory |
| Emotions engine | Yes | Dynamic emotional responses |
| Goals and motivations | Yes | Autonomous behavior drivers |
| Memory (long-term) | Yes | Cross-session persistence |
| Voice integration | Yes | Text-to-speech |
| Scene/scenario setup | Yes | Context definition |
| Knowledge base | Yes | Facts and lore |
| API integration | Yes | For game engines |
| File export | No | API-only, platform-locked |
| Community sharing | No | Enterprise-focused |
| **Relevance to SoulGen** | Medium | Slider-based personality is closest UX analog, but Inworld targets game NPCs, not agent files |

---

## Key Insights Summary

### What Works in Existing Tools
1. **Structured creation beats free-form.** GPT Builder's conversational approach is powerful but requires an AI layer SoulGen doesn't have. Structured wizards with sliders/cards give users guardrails that produce more consistent output.
2. **Presets accelerate creation.** Every successful tool offers starting points. The first click should never be a blank slate.
3. **Live preview builds confidence.** GPT Builder's side-by-side preview is its strongest UX pattern. SoulGen should show real-time summary as close to this as possible without LLM calls.
4. **Export/portability matters.** Platform-locked tools (Character.AI, GPT Builder) frustrate power users. SillyTavern's exportable character cards drove community adoption.

### What SoulGen Does Differently
1. **File output (not a chat platform).** SoulGen generates markdown files for an agent framework, not a chatbot-as-a-service.
2. **Philosophy-as-personality.** SOUL.md is a manifesto, not a system prompt. The generation step must translate slider values into philosophical statements, not instruction lists.
3. **DNA intermediate representation.** The JSON DNA layer is an architectural asset -- it enables sharing, versioning, cloning, and regeneration that competing tools lack.
4. **Zero infrastructure.** BYO API key, localStorage, no accounts. This is both a constraint and a feature (privacy, simplicity, zero cost).

### Critical Risk: The Slider-to-Prose Gap
The biggest technical risk is translating abstract slider values (warmth: 0.7, humor: 3/5) into meaningful, distinct prose in SOUL.md. Research shows personality sliders have weak mappings to actual LLM behavior. Mitigation strategies:
- Use presets and archetypes to anchor generation (not just raw slider values)
- Include example SOUL.md files as few-shot examples in the generation prompt
- Test generated output against slider intentions during development
- Allow manual editing as escape hatch

---

*Research conducted: 2026-02-05*
*Sources accessed: 30+ web searches across character creation tools, wizard UX patterns, personality models, and agent configuration frameworks*
