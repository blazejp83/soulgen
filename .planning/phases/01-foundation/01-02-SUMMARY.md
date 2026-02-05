---
phase: 01-foundation
plan: 02
subsystem: api, ui
tags: [ai-sdk, openai, anthropic, openrouter, streaming, settings, provider-adapter]

# Dependency graph
requires:
  - phase: 01-01
    provides: "Next.js app shell, Zustand stores, shadcn/ui components, TypeScript types"
provides:
  - "Streaming LLM proxy API route at /api/chat"
  - "Multi-provider adapter (OpenAI, Anthropic, OpenRouter)"
  - "Settings page with provider/model/API key management"
  - "Simple/Advanced mode toggle in app header"
  - "AppHeader component with brand, mode toggle, settings link"
affects: [01-03, 03-generation-pipeline]

# Tech tracking
tech-stack:
  added: [ai@6.0.71, "@ai-sdk/openai@3.0.25", "@ai-sdk/anthropic@3.0.36", "@openrouter/ai-sdk-provider@2.1.1"]
  patterns: [proxy-api-key-pattern, ai-sdk-streamtext, provider-adapter-factory]

key-files:
  created:
    - src/lib/providers.ts
    - src/app/api/chat/route.ts
    - src/components/api-key-input.tsx
    - src/components/provider-selector.tsx
    - src/components/mode-toggle.tsx
    - src/components/app-header.tsx
    - src/app/settings/page.tsx
  modified:
    - src/app/layout.tsx
    - package.json

key-decisions:
  - "Used @openrouter/ai-sdk-provider instead of non-existent @ai-sdk/openrouter"
  - "Used toTextStreamResponse() instead of toDataStreamResponse() for AI SDK v6 compatibility"
  - "Used ModelMessage type from ai package for proper message typing"

patterns-established:
  - "Proxy pattern: client sends API key in request body, server-side route proxies to LLM provider"
  - "Provider adapter factory: getProvider/getModel functions abstract provider creation"
  - "SSR hydration guard on all store-dependent UI components"

# Metrics
duration: 26min
completed: 2026-02-05
---

# Phase 1 Plan 02: API Route & Settings Summary

**Streaming LLM proxy with multi-provider adapter (OpenAI/Anthropic/OpenRouter via AI SDK v6), settings page with provider tabs, model dropdown, API key management, and Simple/Advanced mode toggle in header**

## Performance

- **Duration:** 26 min
- **Started:** 2026-02-05T12:14:51Z
- **Completed:** 2026-02-05T12:40:34Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Streaming API route at /api/chat accepting provider, API key, model, and messages with maxDuration=60 for Vercel
- Multi-provider adapter supporting OpenAI, Anthropic, and OpenRouter with hardcoded model lists
- Settings page at /settings with tabbed provider selection, model dropdown, and API key input with show/hide toggle
- AppHeader with SoulGen brand, Simple/Advanced mode toggle, and settings gear icon
- Layout updated with sticky header and proper content area

## Task Commits

Each task was committed atomically:

1. **Task 1: Create multi-provider adapter and streaming API route** - `64daa52` (feat)
2. **Task 2: Build settings page with provider selection, API key management, and mode toggle** - `356c656` (feat)

## Files Created/Modified

- `src/lib/providers.ts` - Provider adapter with getProvider, getModel, model lists
- `src/app/api/chat/route.ts` - Streaming POST handler proxying LLM calls
- `src/components/api-key-input.tsx` - API key input with show/hide toggle and privacy note
- `src/components/provider-selector.tsx` - Provider tabs + model dropdown + API key input
- `src/components/mode-toggle.tsx` - Simple/Advanced switch component
- `src/components/app-header.tsx` - Sticky header with brand, mode toggle, settings link
- `src/app/settings/page.tsx` - Settings page with card-based layout
- `src/app/layout.tsx` - Updated with AppHeader and main content wrapper
- `package.json` - Added ai, @ai-sdk/openai, @ai-sdk/anthropic, @openrouter/ai-sdk-provider

## Decisions Made

- Used `@openrouter/ai-sdk-provider` package (the official OpenRouter AI SDK provider) instead of the non-existent `@ai-sdk/openrouter` specified in the plan
- Used `toTextStreamResponse()` for AI SDK v6 instead of `toDataStreamResponse()` which no longer exists in this version
- Used `ModelMessage` type import from the `ai` package to satisfy strict TypeScript typing for messages array

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Used @openrouter/ai-sdk-provider instead of @ai-sdk/openrouter**
- **Found during:** Task 1 (package installation)
- **Issue:** `@ai-sdk/openrouter` does not exist on npm (404). The correct package is `@openrouter/ai-sdk-provider` (published by the OpenRouter team)
- **Fix:** Installed `@openrouter/ai-sdk-provider` and used `createOpenRouter` from it
- **Files modified:** package.json, src/lib/providers.ts
- **Verification:** Build passes, provider adapter works
- **Committed in:** 64daa52 (Task 1 commit)

**2. [Rule 3 - Blocking] Used toTextStreamResponse() instead of toDataStreamResponse()**
- **Found during:** Task 1 (API route implementation)
- **Issue:** AI SDK v6 no longer exports `toDataStreamResponse()`. The streaming response method is `toTextStreamResponse()`
- **Fix:** Used `toTextStreamResponse()` for the streaming response
- **Files modified:** src/app/api/chat/route.ts
- **Verification:** Build passes, route exports POST handler
- **Committed in:** 64daa52 (Task 1 commit)

**3. [Rule 3 - Blocking] Used ModelMessage type for proper message typing**
- **Found during:** Task 1 (API route implementation)
- **Issue:** `Array<{ role: string; content: string }>` is not assignable to `ModelMessage[]` because `role: string` is too broad
- **Fix:** Imported `ModelMessage` type from `ai` package and used it for the messages parameter type
- **Files modified:** src/app/api/chat/route.ts
- **Verification:** Build passes with no TypeScript errors
- **Committed in:** 64daa52 (Task 1 commit)

---

**Total deviations:** 3 auto-fixed (3 blocking)
**Impact on plan:** All fixes necessary to work with current AI SDK v6 and correct npm packages. No scope creep.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Streaming API route ready for Phase 3 generation pipeline consumption
- Settings page complete with all provider/model/key management
- Mode toggle functional and persisting via Zustand localStorage
- Ready for 01-03-PLAN.md (if exists) or Phase 2 wizard UI

---
*Phase: 01-foundation*
*Completed: 2026-02-05*
