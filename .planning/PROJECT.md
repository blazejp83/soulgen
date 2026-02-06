# SoulGen

## What This Is

A web application for the OpenClaw community that lets users visually define an AI agent's personality "DNA" — temperament, communication style, role, domains — through an interactive wizard, then generates ready-to-use `SOUL.md`, `IDENTITY.md`, and `USER.md` files powered by the user's own LLM API key. Think character creator for AI agents.

## Core Value

Anyone can create a distinct, well-crafted agent personality without writing a single line of markdown — just configure sliders and options, hit generate, and get files that make an OpenClaw agent feel like a real individual.

## Requirements

### Validated

- Multi-step wizard flow: Archetype -> Temperament -> Communication Style -> Work Style -> User Relationship -> Domains -> Summary -> Generate -> Export — v1.0
- Archetype selection: 7 predefined role cards plus custom with descriptions and tags — v1.0
- Temperament configuration: 6 bipolar sliders with 4 presets (Melancholic, Joyful, Angry, Haughty) — v1.0
- Communication style settings: Formality, humor, directness, response length, structure preference, jargon level — v1.0
- Work style settings: Default depth, explanation style, tool usage preference, uncertainty tolerance — v1.0
- User relationship settings: Address form, feedback style, proactivity level, language (including custom input) — v1.0
- Domain/specialization selection: 6 predefined domains + custom with priority marking (max 3) — v1.0
- DNA summary view: Readable summary + raw JSON edit mode for power users — v1.0
- LLM-powered file generation: DNA -> SOUL.md + IDENTITY.md + USER.md with streaming progress — v1.0
- Multi-provider LLM support: OpenAI, Anthropic, OpenRouter with user-provided API keys — v1.0
- File preview & editing: Tabbed view with markdown rendering, editing, undo/redo history — v1.0
- Export: ZIP download, copy-to-clipboard, shareable URLs — v1.0
- Settings page: API key entry, model selection, provider switching — v1.0
- Simple vs Advanced mode: Simple shows key options; Advanced reveals all parameters — v1.0
- Load existing DNA: Import JSON, URL sharing for cloning — v1.0
- localStorage persistence: Save API keys, created agent profiles, and settings — v1.0

### Active

- [ ] i18n: English and Polish UI (generated files always in English)
- [ ] Agent chat preview: Test generated personality with mini chat interface

### Out of Scope

- User accounts / authentication — no backend, users bring their own API keys
- Server-side storage / database — localStorage only
- Real OpenClaw integration / plugin system — just generates files for manual use
- Mobile-native app — web-responsive is sufficient
- Agent orchestration / runtime — this is a personality file generator, not an agent runtime

## Context

**Current State (v1.0 shipped):**
- ~5,757 lines of TypeScript across 24 source files
- Tech stack: Next.js 15, React 19, Tailwind CSS v4, shadcn/ui, Zustand 5, AI SDK v6
- Providers: OpenAI, Anthropic, OpenRouter via AI SDK provider adapters
- Full wizard flow working end-to-end with streaming generation

**User Feedback Incorporated:**
- Custom language input (not limited to dropdown options)
- Custom domain areas (beyond 6 predefined)

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
| Next.js on Vercel | Free hosting, API routes for key proxying, good DX | Good |
| User-provided API keys (no backend auth) | Zero cost, no user management overhead | Good |
| Multi-provider (OpenAI, Anthropic, OpenRouter) | Flexibility for community, OpenRouter covers long tail | Good |
| localStorage for persistence | No backend needed, keeps it simple and free | Good |
| AI SDK v6 with streaming | Modern streaming API, works with all providers | Good |
| Delimiter-based file parsing | Simpler than JSON for streaming, easier to debug | Good |
| Simple inline markdown parser | Avoids heavy dependency, sufficient for file formats | Good |
| client-zip for ZIP export | Browser-only, works with dynamic import | Good |
| Base64 URL sharing | Compact, URL-safe, no server needed | Good |

---
*Last updated: 2026-02-06 after v1.0 milestone*
