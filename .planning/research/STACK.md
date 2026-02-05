# SoulGen Technology Stack Research

> Research date: 2026-02-05
> Domain: AI agent personality generator (wizard/configurator web app)
> Deployment: Vercel free tier (Hobby plan)
> i18n: English (EN) + Polish (PL)
> LLM providers: OpenAI, Anthropic, OpenRouter (user's own API key)

---

## 1. Core Technology Table

| Category | Package | Version | Purpose | Confidence |
|---|---|---|---|---|
| Framework | `next` | 15.5.x (latest 15.5.9) | App Router, SSR, API routes | HIGH |
| React | `react` / `react-dom` | 19.x | UI rendering | HIGH |
| Language | `typescript` | 5.9.x (latest 5.9.3) | Type safety | HIGH |
| Styling | `tailwindcss` | 4.x (latest 4.1.18) | Utility-first CSS | HIGH |
| UI Components | `shadcn/ui` (CLI-installed) | latest (not versioned; copy-paste model) | Slider, Card, Form, Dialog, Tabs, Progress | HIGH |
| Forms | `react-hook-form` | 7.x (latest 7.71.1) | Multi-step form state, validation | HIGH |
| Validation | `zod` | 4.x (latest 4.3.5) | Schema validation, type inference | HIGH |
| Form Resolver | `@hookform/resolvers` | 5.x (latest 5.2.2) | Zod + React Hook Form bridge | HIGH |
| State Management | `zustand` | 5.x (latest 5.0.10) | Global wizard state, localStorage persist | HIGH |
| i18n | `next-intl` | 4.x (latest 4.7.0) | Internationalization (EN/PL) | HIGH |
| LLM Integration | `ai` (Vercel AI SDK) | 4.x (latest 4.1.x) | Unified LLM provider API, streaming | HIGH |
| LLM: OpenAI | `@ai-sdk/openai` | 1.x (matching ai@4) | OpenAI provider | HIGH |
| LLM: Anthropic | `@ai-sdk/anthropic` | 1.x (matching ai@4) | Anthropic provider | HIGH |
| LLM: OpenRouter | `@openrouter/ai-sdk-provider` | 1.x (latest 1.5.4) | OpenRouter provider | HIGH |
| Markdown Rendering | `react-markdown` | 10.x (latest 10.1.0) | Preview/render generated .md files | HIGH |
| Markdown Plugins | `remark-gfm` | latest | GitHub Flavored Markdown support | HIGH |
| ZIP Generation | `client-zip` | 2.x (latest 2.5.0) | Client-side ZIP file creation | HIGH |
| File Download | Native `Blob` + `URL.createObjectURL` | built-in | Trigger browser download | HIGH |

### Version Decision: Next.js 15 vs 16

**Recommendation: Next.js 15.5.x** (not 16)

While Next.js 16.1.x is now available with stable Turbopack and React Compiler support, Next.js 15.5.x is the safer choice for SoulGen because:

1. **Ecosystem maturity** -- next-intl 4.x, shadcn/ui, and the broader middleware/plugin ecosystem have been battle-tested on Next.js 15 for over a year.
2. **AI SDK compatibility** -- Vercel AI SDK v4.x documentation and examples are primarily written for Next.js 15.
3. **Vercel Hobby plan stability** -- Next.js 15 has a proven deployment track record on the free tier.
4. **Lower risk** -- Next.js 16 removes `next lint` and changes ESLint config patterns, adds React Compiler (still maturing), and changes caching semantics.
5. **Upgrade path** -- When the ecosystem catches up, upgrading 15 -> 16 is straightforward.

If starting fresh and comfortable with newer patterns, Next.js 16 is viable but adds integration risk with i18n and UI libraries.

### Version Decision: Vercel AI SDK 4 vs 5 vs 6

**Recommendation: AI SDK 4.x (stable)** for SoulGen's use case.

The AI SDK has progressed rapidly (v5 in July 2025, v6 in Jan 2026), but for SoulGen's needs:

1. **SoulGen does NOT need agents or multi-step tool loops** -- it sends a single structured prompt to an LLM and gets back markdown text. The v5/v6 agent abstractions (`ToolLoopAgent`, `UIMessage` format, `stopWhen` conditions) are overkill.
2. **v4.x has `streamText` / `generateText`** -- which is exactly what SoulGen needs. These are stable, well-documented, and simple.
3. **v5 has breaking changes** -- new message format (`parts` instead of `content`), removed `maxSteps` from `useChat`, changed body behavior. Unnecessary migration pain.
4. **v6 builds on v5** -- same concerns apply plus additional abstractions.
5. **Provider packages** -- `@ai-sdk/openai`, `@ai-sdk/anthropic`, and `@openrouter/ai-sdk-provider` all work with v4.x.

If the project later needs agentic behavior (multi-turn, tool calling), upgrade to v5/v6 using `npx @ai-sdk/codemod`.

**IMPORTANT**: Pin `ai` to `^4.1.0` in package.json to avoid accidental major version bumps.

---

## 2. Supporting Libraries

| Package | Version | Purpose | Confidence |
|---|---|---|---|
| `@radix-ui/react-slider` | latest | Underlying primitive for shadcn Slider | HIGH |
| `@radix-ui/react-tabs` | latest | Underlying primitive for shadcn Tabs | HIGH |
| `@radix-ui/react-dialog` | latest | Underlying primitive for shadcn Dialog | HIGH |
| `@radix-ui/react-progress` | latest | Step progress indicator | HIGH |
| `@radix-ui/react-tooltip` | latest | Tooltips for sliders/options | HIGH |
| `lucide-react` | latest | Icon set (used by shadcn/ui) | HIGH |
| `clsx` | latest | Conditional classNames | HIGH |
| `tailwind-merge` | latest | Merge Tailwind classes safely | HIGH |
| `class-variance-authority` | latest | Component variant styling (cva) | HIGH |
| `sonner` | latest | Toast notifications (e.g., "Copied!") | MEDIUM |

### Notes on Radix

Radix UI primitives are installed automatically by the shadcn/ui CLI when you add components. You do NOT install them manually. The table above is for reference to show what gets pulled in.

---

## 3. Dev Tools

| Tool | Version | Purpose | Confidence |
|---|---|---|---|
| `typescript` | 5.9.x | Type checking | HIGH |
| `eslint` | 9.x | Linting (flat config) | HIGH |
| `eslint-config-next` | 15.x | Next.js ESLint rules | HIGH |
| `prettier` | 3.x | Code formatting | HIGH |
| `prettier-plugin-tailwindcss` | latest | Sort Tailwind classes | HIGH |
| `@types/react` | 19.x | React type definitions | HIGH |
| `@types/node` | 22.x | Node.js type definitions | MEDIUM |

---

## 4. Installation Commands

### Step 1: Create Next.js Project

```bash
npx create-next-app@15 soulgen \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"
```

### Step 2: Initialize shadcn/ui

```bash
cd soulgen
npx shadcn@latest init
```

### Step 3: Add shadcn/ui Components

```bash
npx shadcn@latest add button card dialog form input label progress select slider tabs textarea tooltip
```

### Step 4: Install Core Dependencies

```bash
# State management + persistence
npm install zustand

# Form handling + validation
npm install react-hook-form @hookform/resolvers zod

# Internationalization
npm install next-intl

# LLM integration (pin to v4)
npm install ai@^4.1.0 @ai-sdk/openai @ai-sdk/anthropic @openrouter/ai-sdk-provider

# Markdown rendering
npm install react-markdown remark-gfm

# ZIP generation (client-side)
npm install client-zip

# Toast notifications
npm install sonner
```

### Step 5: Install Dev Dependencies

```bash
npm install -D prettier prettier-plugin-tailwindcss
```

---

## 5. Architecture Patterns

### Multi-Step Wizard Pattern

The recommended pattern for Next.js App Router wizard:

```
src/app/[locale]/wizard/
  layout.tsx          -- Wizard shell (progress bar, nav)
  page.tsx            -- Redirect to step 1
  step/[step]/
    page.tsx          -- Dynamic step renderer
```

**State approach**: Use Zustand with `persist` middleware for wizard state. Each step reads/writes to the same store. This gives:
- Automatic localStorage persistence (survives refresh)
- No prop drilling across steps
- Type-safe state shape with Zod schemas
- URL-based step navigation (shareable, back button works)

**Validation approach**: Each step has its own Zod schema. React Hook Form + `zodResolver` handles per-step validation. The Zustand store holds the "committed" state (validated data from completed steps).

```typescript
// Example: Zustand wizard store with persist
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface WizardState {
  currentStep: number
  personality: PersonalityData
  identity: IdentityData
  // ...
  setStep: (step: number) => void
  updatePersonality: (data: Partial<PersonalityData>) => void
}

export const useWizardStore = create<WizardState>()(
  persist(
    (set) => ({
      currentStep: 1,
      personality: defaultPersonality,
      identity: defaultIdentity,
      setStep: (step) => set({ currentStep: step }),
      updatePersonality: (data) =>
        set((state) => ({
          personality: { ...state.personality, ...data },
        })),
    }),
    { name: 'soulgen-wizard' }
  )
)
```

### LLM Integration Pattern

Use Next.js Route Handlers (API routes) to proxy LLM calls:

```
src/app/api/generate/route.ts   -- POST handler for generation
```

The user's API key is sent in the request body (never stored server-side). The Route Handler:
1. Receives the wizard data + API key + provider selection
2. Constructs the prompt
3. Calls the appropriate provider via AI SDK
4. Streams the response back to the client

```typescript
// Example: Route handler with multi-provider support
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

export async function POST(req: Request) {
  const { provider, apiKey, model, prompt } = await req.json()

  const providerInstance = getProvider(provider, apiKey)

  const result = streamText({
    model: providerInstance(model),
    prompt,
  })

  return result.toDataStreamResponse()
}
```

### i18n Pattern (next-intl)

```
src/
  i18n/
    request.ts        -- Server-side locale config
    routing.ts        -- Locale routing config
  messages/
    en.json           -- English translations
    pl.json           -- Polish translations
  app/
    [locale]/
      layout.tsx      -- NextIntlClientProvider wrapper
      wizard/
        ...
  middleware.ts       -- Locale detection + redirect
```

next-intl with App Router uses:
- `[locale]` dynamic segment in the app directory
- `NextIntlClientProvider` in the locale layout
- `useTranslations()` hook in components
- `getTranslations()` for server components
- Middleware for locale detection and URL rewriting

---

## 6. Vercel Free Tier (Hobby Plan) Constraints

| Resource | Limit | Impact on SoulGen |
|---|---|---|
| Bandwidth | 100 GB/month | More than sufficient for a wizard app |
| Serverless Function Invocations | 150,000/month | Each LLM generation = 1 invocation. Adequate for community tool |
| Function Duration (standard) | 10 seconds default | CRITICAL: LLM streaming may exceed this. Must configure `maxDuration` |
| Function Duration (Fluid Compute) | Up to 300 seconds | Use Fluid Compute for LLM routes |
| Function Memory | 1024 MB (fixed) | Sufficient for prompt construction + streaming |
| Build Minutes | 6,000/month | Ample for regular deploys |
| Deployments | 100/day | Sufficient |
| Edge Requests | 1,000,000/month | More than enough |
| Projects | 200 | N/A |
| Team Members | 1 (solo only) | Fine for personal/community project |
| Commercial Use | NOT ALLOWED | SoulGen must remain free/non-commercial |

### Critical Vercel Considerations

1. **Function timeout**: The default 10s timeout on Hobby will kill LLM streaming responses. Solution: use `export const maxDuration = 60;` in route handlers (or up to 300s with Fluid Compute). Verify this works on Hobby tier -- some sources indicate 60s max on Hobby.

2. **No overages**: If you hit limits on Hobby, requests fail. There is no pay-for-overages option.

3. **Streaming is essential**: Use `streamText()` instead of `generateText()` to keep the connection alive and show progressive output. This also provides better UX.

4. **Client-side ZIP generation**: Generate ZIP files entirely in the browser (using `client-zip`). Never use serverless functions for file generation -- saves invocations and avoids timeout issues.

5. **localStorage over database**: All wizard state persists in localStorage. No database needed. Zero backend cost.

---

## 7. Alternatives Considered

### Framework
| Option | Verdict | Reason |
|---|---|---|
| Next.js 16 | VIABLE but not chosen | Newer, less ecosystem testing with next-intl/shadcn. Good upgrade target later. |
| Remix / React Router v7 | REJECTED | Smaller ecosystem, less Vercel integration, no benefit for this use case |
| Astro | REJECTED | Not suited for highly interactive wizard UIs |

### UI Components
| Option | Verdict | Reason |
|---|---|---|
| shadcn/ui + Radix | CHOSEN | Copy-paste model = no bundle bloat, excellent Slider/Form primitives |
| MUI (Material UI) | REJECTED | Heavy bundle, opinionated design, enterprise feel |
| Mantine | REJECTED | Good but heavier than shadcn, less community momentum |
| Ant Design | REJECTED | Heavy, React 19 compatibility concerns, enterprise-focused |
| Headless UI | REJECTED | Fewer components than Radix, less active development |

### State Management
| Option | Verdict | Reason |
|---|---|---|
| Zustand | CHOSEN | Built-in persist middleware, simple API, tiny bundle (~1KB) |
| Jotai | VIABLE | Good for atomic state but no built-in localStorage persist |
| Redux Toolkit | REJECTED | Overkill for wizard form state |
| React Context | REJECTED | Performance issues with frequent slider updates, no persist |
| Valtio | REJECTED | Proxy-based, less predictable with React 19 |

### i18n
| Option | Verdict | Reason |
|---|---|---|
| next-intl | CHOSEN | Built for App Router, 930K+ weekly downloads, excellent TS support |
| next-i18next | REJECTED | Designed for Pages Router; awkward with App Router |
| react-i18next | REJECTED | Not Next.js-native, manual routing setup needed |
| Built-in Next.js i18n | N/A | Next.js removed built-in i18n routing in App Router |

### LLM Integration
| Option | Verdict | Reason |
|---|---|---|
| Vercel AI SDK v4 | CHOSEN | Stable, simple `streamText`/`generateText`, multi-provider |
| Vercel AI SDK v5/v6 | DEFERRED | Agent abstractions unnecessary; breaking changes from v4 |
| OpenAI SDK directly | REJECTED | Only supports OpenAI; no unified multi-provider API |
| Anthropic SDK directly | REJECTED | Only supports Anthropic |
| LangChain.js | REJECTED | Heavy abstraction layer, huge bundle, overkill |

### Markdown
| Option | Verdict | Reason |
|---|---|---|
| react-markdown | CHOSEN | Standard, safe (no dangerouslySetInnerHTML), plugin ecosystem |
| marked + DOMPurify | REJECTED | Lower-level, requires manual sanitization |
| MDX | REJECTED | For authoring content, not rendering user-generated markdown |

### ZIP Generation
| Option | Verdict | Reason |
|---|---|---|
| client-zip | CHOSEN | 6.4KB minified, streaming, 40x faster than JSZip, zero deps |
| JSZip | VIABLE | More popular (15M weekly downloads) but heavier and stale (last update 3 years ago) |
| Server-side ZIP | REJECTED | Wastes serverless invocations, adds latency |

### File Download
| Option | Verdict | Reason |
|---|---|---|
| Native Blob API | CHOSEN | Zero dependency, works in all modern browsers |
| file-saver | REJECTED | 5 years since last update; native Blob API sufficient |

---

## 8. What NOT to Use

| Technology | Reason |
|---|---|
| **Pages Router** | Legacy pattern; App Router is the standard for new Next.js projects |
| **next-i18next** | Designed for Pages Router; does not work well with App Router |
| **Redux / Redux Toolkit** | Overkill for wizard state; Zustand is simpler and smaller |
| **Prisma / Drizzle / any ORM** | No database needed; localStorage handles all persistence |
| **NextAuth / Auth.js** | No user accounts; users provide their own API keys per session |
| **tRPC** | No complex API layer needed; simple Route Handlers suffice |
| **LangChain.js** | Massive bundle, unnecessary abstraction for single-prompt generation |
| **Vercel AI SDK v5/v6** | Breaking changes, agent-focused features SoulGen doesn't need |
| **Framer Motion** (full) | Heavy for simple step transitions; use CSS transitions or `motion` (lightweight) |
| **tailwindcss-animate** | Deprecated pattern for Tailwind v4; use native CSS or tw-animate-css |
| **file-saver** | Abandoned; native Blob + URL.createObjectURL is sufficient |
| **JSZip** | 3 years stale, larger than client-zip; client-zip is actively maintained |
| **Contentful / Sanity CMS** | No CMS needed; all content is wizard-generated |
| **Vercel Postgres / KV / Blob** | No backend storage needed; everything is client-side |

---

## 9. Version Compatibility Matrix

| Package A | Package B | Compatibility Notes |
|---|---|---|
| Next.js 15.5.x | React 19.x | Fully compatible (React 19 stable since Next.js 15.1) |
| Next.js 15.5.x | Tailwind CSS 4.x | Compatible; use `@tailwindcss/postcss` plugin |
| Next.js 15.5.x | next-intl 4.x | Fully compatible; designed for App Router |
| Next.js 15.5.x | shadcn/ui | Compatible; may need `--legacy-peer-deps` with npm + React 19 |
| Tailwind CSS 4.x | shadcn/ui | Compatible; shadcn CLI handles v4 configuration |
| react-hook-form 7.x | zod 4.x | Compatible via `@hookform/resolvers` 5.x |
| ai@4.x | @ai-sdk/openai 1.x | Compatible; matched major version pairing |
| ai@4.x | @ai-sdk/anthropic 1.x | Compatible; matched major version pairing |
| ai@4.x | @openrouter/ai-sdk-provider 1.x | Compatible; community provider |
| zustand 5.x | React 19.x | Fully compatible |
| TypeScript 5.9.x | zod 4.x | Fully compatible; zod 4 designed for TS 5+ |

### Potential Compatibility Risks

1. **npm + React 19 peer deps**: Some packages may warn about React 19 peer dependencies. Use `--legacy-peer-deps` if needed during install.
2. **Tailwind v4 + shadcn animations**: The `tailwindcss-animate` plugin is NOT compatible with Tailwind v4. shadcn/ui now uses `tw-animate-css` or native CSS animations.
3. **AI SDK provider version pinning**: Always pin the `ai` package to `^4.1.0` to avoid pulling in v5+ which has breaking changes.
4. **Zod 4 breaking changes**: Zod 4 (released July 2025) has API differences from Zod 3. Ensure all examples/references target Zod 4 syntax. The `@hookform/resolvers` 5.x supports Zod 4.

---

## 10. Bundle Size Considerations

SoulGen is a wizard UI -- it should load fast. Estimated bundle impact:

| Package | Approx. Size (gzipped) | Notes |
|---|---|---|
| zustand | ~1 KB | Extremely lightweight |
| react-hook-form | ~9 KB | Lightweight for form library |
| zod | ~14 KB | Schema validation |
| next-intl | ~10 KB | i18n with tree-shaking |
| react-markdown | ~12 KB | Markdown rendering |
| client-zip | ~2.6 KB | ZIP generation |
| ai (Vercel AI SDK) | ~15 KB | Core streaming utilities |
| shadcn/ui components | ~0 KB overhead | Copy-paste; only what you use |
| **Total estimated** | **~65 KB** | Well within acceptable range |

Tree-shaking note: All recommended packages support tree-shaking. shadcn/ui components are copied into the project, so only imported components affect bundle size.

---

## 11. Sources

### Official Documentation (HIGH confidence)
- [Next.js 15 Blog Post](https://nextjs.org/blog/next-15) -- Next.js release details
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- Version comparison
- [Next.js App Router i18n](https://nextjs.org/docs/pages/guides/internationalization) -- Built-in i18n status
- [next-intl Official Docs](https://next-intl.dev/docs/getting-started/app-router) -- App Router setup
- [Vercel AI SDK Introduction](https://ai-sdk.dev/docs/introduction) -- SDK overview and providers
- [Vercel AI SDK Migration Guide (4 to 5)](https://ai-sdk.dev/docs/migration-guides/migration-guide-5-0) -- Breaking changes reference
- [Vercel AI SDK Migration Guide (5 to 6)](https://ai-sdk.dev/docs/migration-guides/migration-guide-6-0) -- v6 changes
- [Vercel Hobby Plan Docs](https://vercel.com/docs/plans/hobby) -- Free tier limits
- [Vercel Function Limits](https://vercel.com/docs/functions/limitations) -- Timeout and memory
- [Vercel Limits Page](https://vercel.com/docs/limits) -- All platform limits
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) -- Setup guide
- [shadcn/ui Slider Component](https://ui.shadcn.com/docs/components/slider) -- Slider API
- [shadcn/ui Forms](https://ui.shadcn.com/docs/forms) -- React Hook Form integration
- [Zustand Persist Middleware](https://zustand.docs.pmnd.rs/integrations/persisting-store-data) -- localStorage persistence
- [React Hook Form + Zod](https://react-hook-form.com/get-started) -- Form validation
- [Tailwind CSS v4](https://tailwindcss.com/blog/tailwindcss-v4) -- v4 features and migration
- [react-markdown GitHub](https://github.com/remarkjs/react-markdown) -- Usage and API
- [JSZip Official](https://stuk.github.io/jszip/) -- ZIP generation reference
- [client-zip npm](https://www.npmjs.com/package/client-zip) -- Lightweight alternative

### npm Package Pages (HIGH confidence for version numbers)
- [next on npm](https://www.npmjs.com/package/next) -- v15.5.9 / v16.1.2
- [zustand on npm](https://www.npmjs.com/package/zustand) -- v5.0.10
- [react-hook-form on npm](https://www.npmjs.com/package/react-hook-form) -- v7.71.1
- [zod on npm](https://www.npmjs.com/package/zod) -- v4.3.5
- [@hookform/resolvers on npm](https://www.npmjs.com/package/@hookform/resolvers) -- v5.2.2
- [next-intl on npm](https://www.npmjs.com/package/next-intl) -- v4.7.0
- [ai on npm](https://www.npmjs.com/package/ai) -- v4.x / v5.x / v6.0.69
- [@ai-sdk/openai on npm](https://www.npmjs.com/package/@ai-sdk/openai) -- v1.x (for ai@4) / v3.x (for ai@6)
- [@ai-sdk/anthropic on npm](https://www.npmjs.com/package/@ai-sdk/anthropic) -- v1.x (for ai@4) / v3.x (for ai@6)
- [@openrouter/ai-sdk-provider on npm](https://www.npmjs.com/package/@openrouter/ai-sdk-provider) -- v1.5.4
- [react-markdown on npm](https://www.npmjs.com/package/react-markdown) -- v10.1.0
- [client-zip on npm](https://www.npmjs.com/package/client-zip) -- v2.5.0
- [tailwindcss on npm](https://www.npmjs.com/package/tailwindcss) -- v4.1.18
- [typescript on npm](https://www.npmjs.com/package/typescript) -- v5.9.3

### Community/Blog Sources (MEDIUM confidence)
- [Best i18n Libraries for Next.js App Router 2025](https://medium.com/better-dev-nextjs-react/the-best-i18n-libraries-for-next-js-app-router-in-2025-21cb5ab2219a) -- next-intl comparison
- [State Management in 2025](https://dev.to/saswatapal/do-you-need-state-management-in-2025-react-context-vs-zustand-vs-jotai-vs-redux-1ho) -- Zustand vs Jotai comparison
- [Multi-Step Form with React Hook Form + Zod](https://kodaschool.com/blog/build-a-multistep-form-in-next-js-powered-by-react-hook-form-and-zod) -- Wizard pattern reference
- [OpenRouter Universal API](https://www.codegpt.co/blog/openrouter-universal-api-ai-development) -- Multi-provider context
- [Vercel Pricing Breakdown](https://flexprice.io/blog/vercel-pricing-breakdown) -- Hidden costs analysis
- [React Hook Form with Zod Complete Guide 2026](https://dev.to/marufrahmanlive/react-hook-form-with-zod-complete-guide-for-2026-1em1) -- Integration patterns
- [Next.js 15 vs 16 Comparison](https://www.descope.com/blog/post/nextjs15-vs-nextjs16) -- Feature comparison

### LOW Confidence Items
- **AI SDK v4 exact latest patch version**: The npm registry shows ai@4.x exists but the exact latest v4 patch was not directly confirmed. Pin to `^4.1.0` and verify with `npm view ai@4 version`.
- **@ai-sdk/openai v1.x exact version for ai@4**: Provider package versioning may have shifted. Verify compatible version with `npm info @ai-sdk/openai versions`.
- **Vercel Hobby function timeout**: Sources conflict between 10s default and 60s max. The official docs page should be checked at deploy time. Fluid Compute (300s) may or may not be available on Hobby.
- **Tailwind v4 animation compatibility with shadcn**: The migration from `tailwindcss-animate` to `tw-animate-css` or native CSS is ongoing. shadcn CLI should handle it, but verify during setup.

---

## 12. Quick Reference: Full Dependency List

```json
{
  "dependencies": {
    "next": "^15.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-intl": "^4.7.0",
    "zustand": "^5.0.0",
    "react-hook-form": "^7.71.0",
    "@hookform/resolvers": "^5.2.0",
    "zod": "^4.3.0",
    "ai": "^4.1.0",
    "@ai-sdk/openai": "^1.0.0",
    "@ai-sdk/anthropic": "^1.0.0",
    "@openrouter/ai-sdk-provider": "^1.5.0",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.0",
    "client-zip": "^2.5.0",
    "sonner": "^2.0.0",
    "lucide-react": "^0.400.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^3.0.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.5.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/node": "^22.0.0"
  }
}
```

> Note: The versions above use caret ranges (`^`) for flexibility within major versions. The `ai` package is intentionally pinned to `^4.1.0` to prevent v5+ installation.
