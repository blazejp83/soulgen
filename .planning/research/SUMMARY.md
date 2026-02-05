# Project Research Summary

**Project:** SoulGen
**Domain:** AI agent personality generator (web-based wizard tool)
**Researched:** 2026-02-05
**Confidence:** HIGH

## Executive Summary

SoulGen is a purpose-built wizard for the OpenClaw community that translates visual personality configuration (sliders, archetypes, domain tags) into markdown identity files (SOUL.md, IDENTITY.md, USER.md). The research confirms this is a well-understood domain: multi-step wizard UIs, multi-provider LLM integration, and client-side file generation are all established patterns with mature tooling. The recommended stack (Next.js 15 + shadcn/ui + Zustand + Vercel AI SDK v4) is battle-tested and keeps the total bundle under ~65KB gzipped.

The key architectural insight is that SoulGen's core is a **pipeline**: wizard UI accumulates a DNA JSON object → prompt builder converts DNA to an LLM prompt → API route proxies the call → parser splits the streamed response into separate files → preview/export delivers the output. Each stage is independent and testable. The single-page wizard pattern (state-driven steps, not route-per-step) avoids the complexity most Next.js wizard implementations get wrong.

The biggest technical risk is the **Vercel Hobby plan 10-second function timeout** — LLM generation routinely exceeds this. Streaming responses via Vercel AI SDK is the mandatory mitigation. Secondary risks are LLM output inconsistency across providers and the slider-to-prose gap (translating abstract slider values into distinctive personality prose). Both are addressed through prompt engineering with few-shot examples, output validation, and manual editing as escape hatch.

## Key Findings

### Recommended Stack

Next.js 15.5.x on Vercel with shadcn/ui for the component layer. The stack is lean and purpose-fit:

**Core technologies:**
- **Next.js 15.5.x** (App Router): Framework + API routes for LLM proxying — mature ecosystem, Vercel-native
- **Zustand 5.x + persist middleware**: Wizard state + localStorage persistence in one layer (~1KB)
- **Vercel AI SDK 4.x**: Unified multi-provider LLM integration with `streamText()` — pinned to v4 to avoid v5/v6 agent abstractions SoulGen doesn't need
- **shadcn/ui + Radix**: Copy-paste UI components (Slider, Card, Tabs, Form) — zero bundle overhead beyond what's used
- **React Hook Form 7.x + Zod 4.x**: Per-step validation with type inference
- **next-intl 4.x**: App Router i18n (EN/PL) — the de facto standard (930K+ weekly downloads)
- **client-zip 2.x**: Client-side ZIP generation (6.4KB, 40x faster than JSZip)
- **react-markdown 10.x**: Markdown preview rendering

### Expected Features

**Must have (table stakes):**
- Multi-step wizard with labeled progress indicator and step jumping
- Archetype card selection as entry point (7 predefined roles)
- Temperament sliders (5 bipolar sliders with labeled endpoints, center-default)
- Presets that pre-fill slider values (Melancholic, Joyful, Angry, Haughty)
- Summary/review step before generation (with estimated API cost)
- Tabbed file preview (SOUL.md | IDENTITY.md | USER.md) with markdown rendering
- Export: ZIP download + copy-to-clipboard per file
- localStorage auto-save with resume-on-return
- BYO API key management with provider selection and key validation
- Simple/Advanced mode toggle

**Should have (competitive):**
- DNA-as-data architecture (JSON intermediate for sharing, versioning, cloning)
- Per-section regeneration (regenerate IDENTITY.md while keeping SOUL.md)
- Live personality summary (template-based, updates in real-time without LLM calls)
- Shareable URLs (base64-encoded DNA in query params)

**Defer (v2+):**
- Agent chat preview (test personality with mini chat interface)
- Community preset gallery (GitHub-backed, no backend needed)
- Alternative export formats (ElizaOS character files, SillyTavern cards)

### Architecture Approach

Single-page wizard at `/wizard` with state-driven step rendering (not route-per-step). Three Zustand stores (wizard, generation, settings) each with independent localStorage persistence. API route at `/api/generate` proxies LLM calls via Vercel AI SDK's `streamText()` to avoid exposing user API keys in client-side network requests.

**Major components:**
1. **WizardShell + Step Components** — multi-step form UI, each step reads/writes to wizardStore
2. **PromptBuilder + LLM Provider Adapter** — converts DNA JSON to provider-specific LLM calls
3. **API Route Proxy** — receives DNA + API key, streams LLM response back to client
4. **ResponseParser + FilePreview** — splits streamed output by delimiters into SOUL/IDENTITY/USER tabs
5. **ExportManager** — client-side ZIP generation, clipboard copy, OpenClaw config snippets

### Critical Pitfalls

1. **Vercel 10s timeout kills LLM calls** — Must use streaming from day one. `streamText()` keeps the connection alive as chunks arrive. Set `export const maxDuration = 60;` and verify Fluid Compute availability on Hobby plan.
2. **API key exposure via localStorage XSS** — Accept the tradeoff but minimize attack surface: strict CSP headers, zero third-party scripts, proxy pattern so keys never appear in client-side external requests.
3. **LLM output inconsistency across providers** — Anthropic requires `max_tokens`, different streaming formats, different error shapes. Use Vercel AI SDK's unified interface. Always validate output structure post-generation.
4. **Wizard state lost on refresh** — Zustand persist middleware + hydration safety hook. Show skeleton during hydration to avoid React mismatch errors.
5. **i18n redirect loops** — Configure middleware matcher to exclude API routes and static assets. Use next-intl's documented App Router patterns.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Project Foundation
**Rationale:** Streaming architecture, provider abstraction, and security model must be decided before any feature code. The Vercel timeout constraint is foundational.
**Delivers:** Next.js project scaffold, shadcn/ui setup, Zustand stores with persist, i18n skeleton, API route with streaming LLM proxy, provider adapter pattern
**Addresses:** Table stakes (project setup, state persistence)
**Avoids:** P1 (timeout), P2 (key security), P5 (provider differences), P6 (i18n redirects)

### Phase 2: Wizard UI + DNA Engine
**Rationale:** The wizard is the core UX. All configuration steps must work with persistence before connecting to LLM generation.
**Delivers:** All wizard steps (Archetype → Temperament → Communication → Domains → Summary), Simple/Advanced toggle, progress indicator, DNA JSON accumulation
**Addresses:** Table stakes (wizard flow, sliders, presets, archetype cards, domain selection)
**Avoids:** P3 (state loss), UX1-UX3 (step overload, progress, back nav), UX6 (no drafts)

### Phase 3: LLM Generation Pipeline
**Rationale:** With wizard UI complete and DNA JSON flowing, connect the generation pipeline. This is the highest-risk phase (LLM output consistency, multi-provider support).
**Delivers:** Prompt builder, generation API route, stream consumption, response parser, output validation, error handling per provider
**Uses:** Vercel AI SDK v4, @ai-sdk/openai, @ai-sdk/anthropic, @openrouter/ai-sdk-provider
**Addresses:** Table stakes (LLM generation, multi-provider support)
**Avoids:** P4 (output inconsistency), P5 (provider differences), TD1 (no abstraction), SM1-SM3 (security)

### Phase 4: Preview, Export & Polish
**Rationale:** With generation working, build the output layer: preview tabs, markdown editing, ZIP export, clipboard copy.
**Delivers:** Tabbed file preview with markdown rendering, edit mode, per-section regeneration, ZIP export, copy-to-clipboard, OpenClaw config snippets, streaming UI polish
**Addresses:** Table stakes (file preview, export), differentiators (per-section regen)
**Avoids:** P7 (streaming markdown), UX4 (no feedback), UX7 (no preview), PT4 (double-submit)

### Phase 5: i18n, Settings & Launch Readiness
**Rationale:** With core features complete, add Polish language support, settings page, and harden for launch.
**Delivers:** Full EN/PL translations, settings page (API key, provider, model, language), CSP headers, error boundaries, "looks done but isn't" checklist items
**Addresses:** Table stakes (i18n, settings), all remaining pitfalls
**Avoids:** P6 (i18n issues), SM4-SM5 (security headers), all "looks done but isn't" items

### Phase Ordering Rationale

- **Phase 1 first** because streaming architecture and provider abstraction are load-bearing decisions that affect all subsequent code. Getting these wrong forces rewrites.
- **Phase 2 before Phase 3** because the wizard UI and DNA JSON structure must be stable before building prompts from them. The wizard can be tested entirely without LLM calls.
- **Phase 3 is the highest-risk phase** — LLM output consistency across 3 providers is the hardest technical challenge. Isolating it allows focused debugging.
- **Phase 4 after Phase 3** because preview and export need generated files to work with.
- **Phase 5 last** because i18n and settings are additive — they don't change core architecture.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3:** LLM prompt engineering for consistent structured output. Need to test actual prompts against all three providers and iterate. Few-shot examples for SOUL.md/IDENTITY.md/USER.md need crafting.
- **Phase 1:** Vercel Hobby plan exact timeout behavior with streaming — sources conflict between 10s hard limit and 60s with `maxDuration`. Must verify at deploy time.

Phases with standard patterns (skip research-phase):
- **Phase 2:** Multi-step wizard with Zustand + React Hook Form is a well-documented pattern.
- **Phase 4:** File preview, markdown rendering, and ZIP export are straightforward implementations.
- **Phase 5:** next-intl i18n and settings pages follow documented patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified on npm with exact versions. Next.js 15 + shadcn/ui + Zustand is a proven combination. AI SDK v4 pinning avoids breaking changes. |
| Features | HIGH | Based on analysis of 6 competitor tools (Character.AI, GPT Builder, Poe, SillyTavern, ElizaOS, Inworld). Feature prioritization grounded in user expectations. |
| Architecture | HIGH | Single-page wizard + Zustand persist + API route proxy is well-documented. 30+ sources confirm patterns. |
| Pitfalls | HIGH | 7 critical pitfalls identified with specific error messages, prevention strategies, and phase mapping. Vercel timeout constraint verified against official docs. |

**Overall confidence:** HIGH

### Gaps to Address

- **Vercel Hobby plan streaming timeout behavior**: Sources conflict on whether streaming extends the 10s timeout on Hobby plan or requires Fluid Compute. Must verify at first deployment.
- **AI SDK v4 exact provider package versions**: The `@ai-sdk/openai` and `@ai-sdk/anthropic` packages compatible with `ai@^4.1.0` need version verification during `npm install`.
- **Slider-to-prose quality**: The biggest product risk is whether LLM generation produces meaningfully different personality prose for different slider configurations. This can only be validated through iterative prompt testing in Phase 3.
- **Tailwind v4 + shadcn animation compatibility**: The migration from `tailwindcss-animate` to CSS-native or `tw-animate-css` is ongoing. shadcn CLI should handle it, but verify during Phase 1 setup.

## Sources

### Primary (HIGH confidence)
- Vercel official docs (function limits, streaming, pricing)
- Next.js 15 official docs (App Router, Route Handlers, i18n)
- Vercel AI SDK docs (streamText, providers, troubleshooting)
- Zustand docs (persist middleware, SSR/hydration)
- next-intl docs (App Router setup, middleware)
- shadcn/ui docs (installation, components)
- npm registry (exact package versions)

### Secondary (MEDIUM confidence)
- Competitor tool analysis (Character.AI, GPT Builder, Poe, SillyTavern, ElizaOS, Inworld)
- Community blog posts on wizard patterns, LLM integration, i18n
- Shopify engineering blog on streaming markdown rendering
- UX research on multi-step form design

### Tertiary (LOW confidence)
- Vercel Hobby plan Fluid Compute availability — conflicting sources
- AI SDK v4 exact compatible provider versions — needs npm verification
- Tailwind v4 animation plugin migration status

---
*Research completed: 2026-02-05*
*Ready for roadmap: yes*
