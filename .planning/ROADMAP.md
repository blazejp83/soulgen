# Roadmap: SoulGen

## Overview

SoulGen goes from zero to a fully functional AI agent personality wizard in 4 phases: lay the foundation (Next.js + streaming + state + providers), build the wizard UI that accumulates a DNA JSON object, wire up LLM generation to turn DNA into personality files, then add preview/editing/export to deliver the final output. Each phase delivers a complete, testable layer.

## Domain Expertise

None

## Phases

- [x] **Phase 1: Foundation** - Project scaffold, state management, API route with streaming LLM proxy, provider abstraction, mode toggle
- [x] **Phase 2: Wizard UI + DNA Engine** - All wizard steps (archetype → temperament → communication → work style → user relationship → domains → summary)
- [ ] **Phase 3: LLM Generation Pipeline** - Prompt builder, streaming generation, response parsing, multi-provider output handling
- [ ] **Phase 4: Preview, Export & Persistence** - Tabbed file preview, markdown editing, ZIP export, profile management, URL sharing

## Phase Details

### Phase 1: Foundation
**Goal**: Working Next.js app with shadcn/ui, Zustand stores with localStorage persistence, streaming API route that proxies LLM calls, multi-provider adapter, API key management UI, and Simple/Advanced mode toggle
**Depends on**: Nothing (first phase)
**Requirements**: AKEY-01, AKEY-02, AKEY-03, AKEY-04, PROV-01, PROV-02, PROV-03, MODE-01, MODE-02, MODE-03, MODE-04, PERS-01, PERS-02
**Research**: Likely (Vercel streaming timeout, AI SDK v4 provider setup)
**Research topics**: Vercel Hobby plan streaming behavior with maxDuration, AI SDK v4 exact compatible provider package versions, Zustand persist hydration patterns
**Plans**: TBD

Plans:
- [x] 01-01: Next.js scaffold + shadcn/ui + Zustand stores + localStorage persistence
- [x] 01-02: API route with streaming LLM proxy + multi-provider adapter + API key management + mode toggle + settings page

### Phase 2: Wizard UI + DNA Engine
**Goal**: Complete multi-step wizard with all configuration steps functional, DNA JSON accumulating correctly, progress indicator, step navigation, and archetype presets pre-filling values
**Depends on**: Phase 1
**Requirements**: WIZD-01, WIZD-02, WIZD-03, WIZD-04, ARCH-01, ARCH-02, ARCH-03, ARCH-04, ARCH-05, ARCH-06, TEMP-01, TEMP-02, TEMP-03, TEMP-04, TEMP-05, COMM-01, COMM-02, COMM-03, COMM-04, COMM-05, COMM-06, WORK-01, WORK-02, WORK-03, WORK-04, USER-01, USER-02, USER-03, USER-04, DOMN-01, DOMN-02, DOMN-03
**Research**: Unlikely (standard wizard UI with Zustand + React Hook Form)
**Plans**: TBD

Plans:
- [x] 02-01: Wizard shell + progress indicator + step navigation + archetype selection step
- [x] 02-02: Temperament sliders + presets + communication style + work style + user relationship steps
- [x] 02-03: Domain selection + summary/review step + DNA JSON validation

### Phase 3: LLM Generation Pipeline
**Goal**: Working end-to-end generation: DNA JSON → prompt → streaming LLM call → parsed SOUL.md + IDENTITY.md + USER.md with progress feedback
**Depends on**: Phase 2
**Requirements**: GENR-01, GENR-02, GENR-03
**Research**: Likely (prompt engineering for structured output, multi-provider consistency)
**Research topics**: Prompt templates for SOUL.md/IDENTITY.md/USER.md, few-shot examples, output delimiter strategy, provider-specific quirks with structured output
**Plans**: TBD

Plans:
- [ ] 03-01: Prompt builder + generation API integration + streaming response parser + generation UI

### Phase 4: Preview, Export & Persistence
**Goal**: Tabbed file preview with markdown rendering and editing, ZIP export, clipboard copy, profile save/load, JSON import, URL sharing
**Depends on**: Phase 3
**Requirements**: WIZD-05, PREV-01, PREV-02, PREV-03, PREV-04, PREV-05, EXPO-01, EXPO-02, EXPO-03, PERS-03, PERS-04, PERS-05, PERS-06, PERS-07
**Research**: Unlikely (standard preview/export patterns, client-zip for ZIP generation)
**Plans**: TBD

Plans:
- [ ] 04-01: Tabbed file preview + markdown rendering + edit mode + version history
- [ ] 04-02: ZIP export + clipboard copy + profile save/load + JSON import + URL sharing

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete | 2026-02-05 |
| 2. Wizard UI + DNA Engine | 3/3 | Complete | 2026-02-05 |
| 3. LLM Generation Pipeline | 0/1 | Not started | - |
| 4. Preview, Export & Persistence | 0/2 | Not started | - |
