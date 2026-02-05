# SoulGen

## What This Is

A web application for the OpenClaw community that lets users visually define an AI agent's personality "DNA" — temperament, communication style, role, domains — through an interactive wizard, then generates ready-to-use `SOUL.md`, `IDENTITY.md`, and `USER.md` files powered by the user's own LLM API key. Think character creator for AI agents.

## Core Value

Anyone can create a distinct, well-crafted agent personality without writing a single line of markdown — just configure sliders and options, hit generate, and get files that make an OpenClaw agent feel like a real individual.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Multi-step wizard flow**: Archetype → Temperament → Communication Style → Domains → Summary → Generate → Export
- [ ] **Archetype selection**: Predefined role cards (Developer, Researcher, Automation/DevOps, PM/Organizer, Coach, Storyteller, General Assistant) with descriptions and tags
- [ ] **Temperament configuration**: Sliders for valence (pessimistic↔optimistic), energy (calm↔energized), warmth (cold↔empathetic), dominance (gentle↔assertive), emotional stability (reactive↔stable). Presets (Melancholic, Joyful, Angry, Haughty) that set slider values
- [ ] **Communication style settings**: Formality, humor (0-5), directness, response length, structure preference, jargon level
- [ ] **Work style settings**: Default depth (overview↔deep dive), explanation style, tool usage preference, uncertainty tolerance
- [ ] **User relationship settings**: Address form, feedback style, proactivity level
- [ ] **Agent response language**: Configurable language preference for how the agent responds (saved in USER.md)
- [ ] **Domain/specialization selection**: Multi-select tags (Coding, Research, Automation, Writing, Planning, Media) with priority marking (max 2-3)
- [ ] **DNA summary view**: Readable summary + raw JSON/advanced edit mode for power users
- [ ] **LLM-powered file generation**: Send DNA payload to LLM, receive SOUL.md + IDENTITY.md + USER.md (optional)
- [ ] **Multi-provider LLM support**: OpenAI (hardcoded models), Anthropic (hardcoded models), OpenRouter (dynamic model list via API). User provides their own API key
- [ ] **File preview & editing**: Tabbed view of generated files with markdown editing, per-section regeneration, and session-local version history
- [ ] **Export**: ZIP download of all files + OpenClaw config snippets + copy-to-clipboard per file
- [ ] **Settings page**: API key entry, model selection, provider switching
- [ ] **Simple vs Advanced mode**: Simple shows key sliders only; Advanced reveals all parameters
- [ ] **Load existing DNA**: Import JSON or paste to edit/clone an existing agent
- [ ] **i18n**: English and Polish UI (generated files always in English)
- [ ] **localStorage persistence**: Save API keys, created agent profiles, and settings in browser
- [ ] **Agent chat preview** (nice-to-have): Test generated personality with a mini chat interface using the generated SOUL/IDENTITY as system prompt

### Out of Scope

- User accounts / authentication — no backend, users bring their own API keys
- Server-side storage / database — localStorage only
- Real OpenClaw integration / plugin system — just generates files for manual use
- Mobile-native app — web-responsive is sufficient
- Agent orchestration / runtime — this is a personality file generator, not an agent runtime

## Context

- **OpenClaw agent identity system**: Agents use `SOUL.md` (behavioral philosophy), `IDENTITY.md` (presentation: name, emoji, creature, vibe, avatar), and `USER.md` (user context/preferences) as text files loaded at session start. See reference files in repo.
- **SOUL.md**: Defines core truths, boundaries, vibe, continuity rules. Written as a manifesto, not a system prompt.
- **IDENTITY.md**: Structured metadata — name, creature type, vibe descriptor, emoji, avatar path.
- **USER.md**: How the agent treats the user — communication preferences, language, relationship style.
- **Existing spec**: Detailed Polish-language spec in `agent-persona-generator-spec.md` covers full UX flow, all form fields, and generation/export mechanics.
- **Design aesthetic**: To be determined via frontend-design skill during implementation — should feel distinctive, not generic.

## Constraints

- **Hosting**: Vercel free tier — no server costs, serverless API routes for LLM proxying
- **Tech stack**: Next.js (for Vercel compatibility + API routes)
- **Cost**: Zero ongoing cost — users provide their own LLM API keys
- **API key security**: Keys stored in localStorage, proxied through API routes (never exposed in client-side network calls to LLM providers)
- **Generated file language**: Always English regardless of UI language
- **Bundle size**: Keep lean — wizard UI with sliders doesn't need heavy dependencies

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js on Vercel | Free hosting, API routes for key proxying, good DX | — Pending |
| User-provided API keys (no backend auth) | Zero cost, no user management overhead | — Pending |
| Multi-provider (OpenAI, Anthropic, OpenRouter) | Flexibility for community, OpenRouter covers long tail | — Pending |
| localStorage for persistence | No backend needed, keeps it simple and free | — Pending |
| i18n (EN/PL) | Creator is Polish, tool is for international OpenClaw community | — Pending |
| Generated files always English | OpenClaw convention, agents respond in configured language via USER.md | — Pending |
| Design via frontend-design skill | Avoid generic AI aesthetic, make it distinctive | — Pending |

---
*Last updated: 2026-02-05 after initialization*
