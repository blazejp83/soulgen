# SoulGen: Critical Pitfalls & Failure Modes Research

> Research date: 2026-02-05
> Domain: AI agent personality generator (Next.js App Router + multi-provider LLM + wizard UI)
> Deployment: Vercel free tier (Hobby plan)
> Architecture: BYOK (Bring Your Own Key) via localStorage, API route proxy, i18n (EN/PL), ZIP export

---

## 1. Critical Pitfalls

### P1: Vercel Hobby Plan 10-Second Function Timeout Kills LLM Calls

**What goes wrong:** API routes that call LLM providers (OpenAI, Anthropic, OpenRouter) return `504 Gateway Timeout` in production. Everything works locally because there is no timeout enforced by the dev server. On Vercel Hobby plan, serverless functions are hard-killed at 10 seconds.

**Why it happens:** LLM API calls routinely take 5-30+ seconds depending on prompt complexity, model load, and output length. Generating multiple markdown files (SOUL.md, IDENTITY.md, USER.md) in a single request will almost certainly exceed 10 seconds.

**How to avoid:**
- Use streaming responses (`streamText` from Vercel AI SDK) instead of waiting for complete responses. Streaming keeps the connection alive as chunks arrive, and Vercel does not kill streaming functions at 10s as long as data is flowing.
- Set `export const maxDuration = 60;` in route handlers (but note: this only extends to 60s on Pro plan; Hobby plan stays at 10s without Fluid Compute).
- Check if Vercel Fluid Compute is available for your project (extends default to 300s on all plans for network-bound functions).
- Generate files one at a time, not all three in a single request.
- Configure `chunkMs` timeout in `streamText` to detect stalled streams.

**Warning signs:** Works perfectly in `next dev`, fails silently or with `504` on Vercel deployment. Intermittent failures that correlate with response length.

**Error messages:**
- `504: GATEWAY_TIMEOUT`
- `FUNCTION_INVOCATION_TIMEOUT`
- `This Serverless Function has timed out`

**Phase to address:** Architecture (Phase 0) -- this is foundational and must be decided before any LLM integration code is written.

**Confidence:** HIGH

**Sources:**
- [Vercel: What can I do about serverless functions timing out](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- [Vercel: Configuring function duration](https://vercel.com/docs/functions/configuring-functions/duration)
- [AI SDK: Troubleshooting timeout on Vercel](https://ai-sdk.dev/docs/troubleshooting/timeout-on-vercel)
- [Vercel: Streaming from LLM](https://vercel.com/kb/guide/streaming-from-llm)
- [Case Study: Solving Vercel 10-Second Limit with QStash](https://medium.com/@kolbysisk/case-study-solving-vercels-10-second-limit-with-qstash-2bceeb35d29b)

---

### P2: API Key Exposure via localStorage and XSS

**What goes wrong:** User-provided API keys stored in localStorage are stolen via XSS attack, malicious browser extension, or compromised third-party dependency. Attacker gains full access to user's OpenAI/Anthropic/OpenRouter account and incurs charges.

**Why it happens:** localStorage is accessible to ANY JavaScript running on the same origin. This includes:
- XSS payloads injected via any input that renders unsanitized HTML
- Third-party scripts (analytics, CDNs) if compromised (supply chain attack)
- Browser extensions with content script permissions
- Any npm dependency in the bundle that gets compromised

**How to avoid:**
- Accept that localStorage for API keys is a known tradeoff in BYOK apps, but minimize the attack surface:
  - Strict Content Security Policy (CSP) headers to block inline scripts and unauthorized script sources
  - Minimize third-party scripts to near-zero
  - Never render user input as HTML without sanitization
  - Keys should flow: localStorage -> API route -> LLM provider. Keys never appear in URLs, query params, or client-side fetch headers
  - Auto-clear keys on explicit logout or after configurable inactivity period
  - Warn users about the security model on key entry (informed consent)
  - Consider encrypting keys in localStorage with a session-derived key (defense in depth, not bulletproof)
- The API route proxy pattern is essential: user's key is sent in the request body to your Next.js API route, which then makes the actual LLM API call server-side. The key never appears in browser network tab as an Authorization header to an external service.

**Warning signs:** No CSP headers configured. Third-party analytics scripts loaded. User input rendered with `dangerouslySetInnerHTML`. Many npm dependencies with deep dependency trees.

**Phase to address:** Architecture (Phase 0) and Security hardening (pre-launch).

**Confidence:** HIGH

**Sources:**
- [XSS: The LocalStorage Robbery](https://shahjerry33.medium.com/xss-the-localstorage-robbery-d5fbf353c6b0)
- [Stop Using localStorage for Sensitive Data](https://www.trevorlasn.com/blog/the-problem-with-local-storage)
- [OWASP: HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html)
- [Auth0: Secure Browser Storage: The Facts](https://auth0.com/blog/secure-browser-storage-the-facts/)
- [Why localStorage is Vulnerable to XSS Attacks](https://design-code.tips/blog/2025-02-28-why-local-storage-is-vulnerable-to-xss-attacks-and-a-safer-alternative/)

---

### P3: Wizard State Lost on Page Refresh or Navigation

**What goes wrong:** User fills in 5+ steps of personality configuration, accidentally refreshes the page or hits the browser back button, and loses all their work. In Next.js App Router, client-side state is destroyed on navigation by default.

**Why it happens:** React component state (useState, useContext) is ephemeral and lives only in memory. The App Router aggressively re-renders on navigation. Without explicit persistence, wizard data evaporates on any page transition.

**How to avoid:**
- Use Zustand with `persist` middleware writing to `sessionStorage` (or `localStorage` for cross-session persistence)
- Handle Next.js hydration mismatch: server render has no access to localStorage, so persisted state shows stale/default values on first render. Use a hydration-safe pattern (useEffect to rehydrate, or Zustand's `onRehydrateStorage` callback)
- Add a `beforeunload` event listener to warn users before closing/refreshing
- Auto-save on every step transition, not just on final submit
- Consider URL-based state for the current step (e.g., `/wizard?step=3`) so browser back/forward works naturally

**Warning signs:** Zustand hydration errors in console. Flash of default content on page load. Users reporting data loss in feedback.

**Error messages:**
- `Hydration failed because the initial UI does not match what was rendered on the server`
- `Text content did not match`

**Phase to address:** Wizard UI implementation (Phase 2).

**Confidence:** HIGH

**Sources:**
- [Zustand: How to restore persisted state on page refresh](https://github.com/pmndrs/zustand/discussions/1569)
- [Fix Next.js hydration error with Zustand](https://medium.com/@koalamango/fix-next-js-hydration-error-with-zustand-state-management-0ce51a0176ad)
- [Zustand persist middleware in Next.js](https://dev.to/abdulsamad/how-to-use-zustands-persist-middleware-in-nextjs-4lb5)
- [CSS-Tricks: Multi-Step Forms](https://css-tricks.com/the-magic-of-react-based-multi-step-forms/)

---

### P4: LLM Output Inconsistency and Parsing Failures

**What goes wrong:** LLM generates markdown that doesn't match expected structure. Missing sections, hallucinated extra sections, inconsistent heading levels, or wrapping output in ```markdown code fences when you don't expect it. The generated SOUL.md works sometimes and is broken other times.

**Why it happens:** LLMs are probabilistic. Even with the same prompt, outputs vary. Common failure modes:
- Model prefixes output with "Here's the markdown file:" before the actual content
- Model wraps output in triple backticks (```markdown ... ```)
- Model omits required sections or adds unrequested ones
- Different providers (OpenAI vs Anthropic vs OpenRouter) interpret the same prompt differently
- Temperature > 0 introduces variation; even temperature = 0 isn't fully deterministic

**How to avoid:**
- Use structured output / JSON mode where available, then convert to markdown programmatically (most reliable)
- If generating markdown directly: provide exact templates with placeholders in the prompt, use few-shot examples, and specify "output ONLY the markdown content with no preamble or code fences"
- Post-process output: strip leading/trailing code fences, validate section headings exist, use regex to check structure
- Set temperature to 0 for maximum consistency
- Implement retry logic: if output validation fails, retry with a more explicit prompt (up to 2-3 times)
- Use provider-specific features: OpenAI's `response_format: { type: "json_object" }`, Anthropic's prefilled assistant messages

**Warning signs:** "It works with GPT-4 but not Claude" or vice versa. Occasional blank sections in generated files. Users getting markdown with code fence wrappers.

**Phase to address:** LLM Integration (Phase 3).

**Confidence:** HIGH

**Sources:**
- [Why Your LLM Returns "Sure! Here's the JSON"](https://dev.to/acartag7/why-your-llm-returns-sure-heres-the-json-and-how-to-fix-it-2b1g)
- [LLMs are bad at returning code in JSON (aider)](https://aider.chat/2024/08/14/code-in-json.html)
- [n8n Community: Consistent markdown/JSON outputs from LLMs](https://community.n8n.io/t/get-consistent-well-formatted-markdown-json-outputs-from-llms/80749)
- [LLM Output Parsing and Structured Generation Guide](https://tetrate.io/learn/ai/llm-output-parsing-structured-generation)
- [Does Prompt Formatting Impact LLM Performance](https://arxiv.org/html/2411.10541v1)

---

### P5: Multi-Provider API Differences Break Abstraction Layer

**What goes wrong:** Code written for OpenAI's API format silently fails or produces wrong results when switched to Anthropic or OpenRouter. Error handling catches OpenAI error shapes but not Anthropic's. Streaming format differences cause client-side parsing failures.

**Why it happens:** Despite superficial similarity, the APIs differ significantly:
- Anthropic **requires** `max_tokens` (fails without it); OpenAI auto-determines it
- Anthropic only supports a single system message at the start; OpenAI allows system messages anywhere
- Anthropic uses `content` as an array of content blocks; OpenAI uses a string or array
- Streaming chunk formats differ (Anthropic SSE vs OpenAI SSE have different event types and data shapes)
- Error response structures are completely different (different field names, status codes, error type enums)
- Rate limit headers have different names and semantics
- OpenRouter silently drops unsupported parameters unless `require_parameters: true` is set

**How to avoid:**
- Use Vercel AI SDK which provides a unified interface across providers (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/openrouter`)
- If building custom: create a provider abstraction layer with explicit adapters for each provider
- Always set `max_tokens` explicitly regardless of provider
- Write integration tests per provider, not just unit tests against mocks
- Handle errors by checking for both provider-specific and generic error shapes
- Use OpenRouter as the unified gateway if multi-provider support is critical (it normalizes differences)

**Warning signs:** "Works with OpenAI but crashes with Anthropic." Error messages mentioning `max_tokens` being required. Streaming works with one provider but shows all text at once with another.

**Phase to address:** LLM Integration (Phase 3).

**Confidence:** HIGH

**Sources:**
- [OpenAI API vs Anthropic API: 2025 Developer Guide](https://www.eesel.ai/blog/openai-api-vs-anthropic-api)
- [Comparing streaming response structures for different LLM APIs](https://medium.com/percolation-labs/comparing-the-streaming-response-structure-for-different-llm-apis-2b8645028b41)
- [Anthropic: OpenAI SDK Compatibility](https://docs.anthropic.com/en/api/openai-sdk)
- [OpenRouter: Provider Routing Documentation](https://openrouter.ai/docs/guides/routing/provider-selection)
- [LiteLLM Documentation](https://docs.litellm.ai/docs/)

---

### P6: i18n Redirect Loops and Hydration Mismatches

**What goes wrong:** App gets stuck in infinite redirect loops when locale detection is enabled and user's browser language differs from default locale. Or: translation strings show briefly in wrong language, then flash to correct language (hydration mismatch). Or: API routes get caught by i18n middleware and fail.

**Why it happens:**
- Next.js middleware for i18n runs on every request, including API routes, static assets, and preflight requests
- When `localeDetection: true` (default in most i18n libs) and user's `Accept-Language` header doesn't match the URL locale, middleware redirects, which triggers another detection, creating a loop
- Server-rendered HTML uses one locale, client hydration picks up a different one from localStorage/cookie, causing React hydration errors
- The App Router handles i18n differently from Pages Router; many tutorials and examples are for the wrong router

**How to avoid:**
- Configure middleware matcher to explicitly exclude API routes, static assets, and `_next` paths: `matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']`
- Disable automatic locale detection and use explicit locale switching (URL-based: `/en/...`, `/pl/...`)
- Store locale preference in a cookie (not just URL) so server and client agree on locale
- Use `next-intl` which handles App Router i18n properly and has documented patterns for avoiding these issues
- Test with browser language set to each supported locale AND to an unsupported locale

**Warning signs:** 307 redirect loops on production. Console errors about hydration. API routes returning HTML instead of JSON. Translations flashing between languages on page load.

**Error messages:**
- `ERR_TOO_MANY_REDIRECTS`
- `307 Temporary Redirect` (in network tab, repeating)
- `Hydration failed because the initial UI does not match`

**Phase to address:** i18n Setup (Phase 1).

**Confidence:** HIGH

**Sources:**
- [Next.js GitHub: 307 redirect loop with locale + middleware](https://github.com/vercel/next.js/issues/55648)
- [next-intl: Middleware documentation](https://next-intl.dev/docs/routing/middleware)
- [Next.js: Internationalization guide](https://nextjs.org/docs/pages/guides/internationalization)
- [LogRocket: Complete guide to Next.js internationalization](https://blog.logrocket.com/complete-guide-internationalization-nextjs/)

---

### P7: Streaming Markdown Rendering Breaks Mid-Stream

**What goes wrong:** While streaming LLM output to the UI, markdown renders incorrectly: half-formed bold text, broken links, unclosed code blocks. The UI flickers between malformed and properly rendered states as chunks arrive.

**Why it happens:** Markdown rendering is inherently stateful. A `**` token could be the start of bold or just two asterisks. During streaming, the parser sees incomplete sequences and cannot determine intent. Additionally, SSE (Server-Sent Events) uses `\n\n` as message delimiters, which conflicts with markdown's use of double newlines for paragraph breaks.

**How to avoid:**
- Use a streaming-aware markdown renderer (e.g., `react-markdown` with a buffer that waits for complete tokens)
- Buffer incomplete markdown sequences before rendering (accumulate a few chunks before updating the display)
- Replace `\n` characters with placeholders during SSE transport, then restore on the client
- Consider rendering plain text during streaming and only applying markdown formatting after stream completes
- Use Vercel AI SDK's `useChat` or `useCompletion` hooks which handle SSE parsing correctly

**Warning signs:** Flashing/flickering markdown during generation. Bold text appearing and disappearing. Code blocks that never close until the stream ends.

**Phase to address:** UI Polish (Phase 4).

**Confidence:** MEDIUM

**Sources:**
- [Solving Markdown Newline Issues in LLM Stream Responses](https://yingjiezhao.com/en/articles/Solving-Markdown-Newline-Issues-in-LLM-Stream-Responses/)
- [Shopify: Sidekick's Improved Streaming Experience](https://shopify.engineering/sidekicks-improved-streaming)
- [Upstash: Resumable LLM Streams](https://upstash.com/blog/resumable-llm-streams)

---

## 2. Technical Debt Patterns

### TD1: No Provider Abstraction Layer
Building directly against OpenAI's API format and then "adding Anthropic support later." Every provider-specific call becomes a refactoring liability. The Vercel AI SDK exists specifically to solve this -- use it from day one.

### TD2: Hardcoded Prompt Strings in Route Handlers
Embedding long prompt templates directly in API route files. As prompts evolve (and they will, constantly), these become unmaintainable. Extract prompts into a dedicated `/lib/prompts/` module with versioning capability.

### TD3: No Output Validation Layer
Trusting LLM output blindly without structural validation. The first time a model returns unexpected output, the app breaks in production. Build a validation layer from the start (check for required headings, section presence, reasonable length).

### TD4: Monolithic Generation Endpoint
A single API route that generates all three files (SOUL.md, IDENTITY.md, USER.md) in one call. This maximizes timeout risk, makes error recovery impossible (if the third file fails, you lose all three), and prevents streaming individual file progress.

### TD5: Translation Strings Mixed with Component Logic
Embedding translation keys inline without a proper namespace structure. When the app grows beyond 2 languages, finding and updating translations becomes a nightmare. Use namespaced translation files from the start (`wizard.step1.title`, `wizard.step1.description`).

### TD6: No Error Boundary Strategy
Missing `error.tsx` files in the App Router route segments. A single unhandled error in any component crashes the entire page instead of being caught by the nearest error boundary.

---

## 3. Integration Gotchas

### IG1: Vercel Hobby Plan Hard Limits (No Overage Allowed)
Unlike Pro plan, the Hobby plan has **hard walls**, not soft limits. When you hit 100 GB bandwidth or 150,000 function invocations per month, your site goes down. There is no option to pay for overages -- you must upgrade to Pro. For an LLM app where each generation could involve multiple streaming function calls, 150K invocations can be reached faster than expected.

**Source:** [Vercel Pricing Breakdown](https://flexprice.io/blog/vercel-pricing-breakdown)

### IG2: 4.5MB Request/Response Body Limit
Vercel serverless functions have a hard 4.5MB limit on request and response bodies. While markdown files are typically small, if you ever add features like base64-encoded images in prompts, or return very large generated content, you'll hit `FUNCTION_RESPONSE_PAYLOAD_TOO_LARGE`.

**Source:** [Vercel: How to bypass body size limit](https://vercel.com/kb/guide/how-to-bypass-vercel-body-size-limit-serverless-functions)

### IG3: Cold Starts on Free Tier
Vercel Hobby plan does NOT get "Always On" functions or Fluid Compute cold-start optimizations. The first request after a period of inactivity will suffer a cold start (typically 1-3 seconds), which is added to the LLM API response time, eating into the 10-second timeout budget.

**Source:** [Vercel: Improve cold start performance](https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel)

### IG4: Edge Runtime vs Node.js Runtime Confusion
Edge runtime has longer timeouts (300s) and is available on all plans, but it does NOT support all Node.js APIs. Many LLM SDKs rely on Node.js-specific features (fs, crypto, certain stream implementations). If you switch to Edge runtime for the timeout benefits, your provider SDK may break.

**Source:** [Vercel: Edge Runtime documentation](https://vercel.com/docs/functions/runtimes/edge)

### IG5: OpenAI API Key Format Changes
OpenAI has historically changed their API key prefix format (from `sk-` to `sk-proj-` and others). Hardcoding validation regex for API key format will break when formats change. Validate by making a lightweight test call (list models endpoint is free) instead of regex matching.

**Source:** [OpenAI Community: Regex for API key validation](https://community.openai.com/t/regex-s-to-validate-api-key-and-org-id-format/44619)

### IG6: OpenRouter Parameter Silently Dropped
When using OpenRouter, if you pass a parameter that the underlying model doesn't support (e.g., `logit_bias` to a Claude model), OpenRouter silently ignores it by default. This can cause unexpected behavior without any error. Set `require_parameters: true` if you need strict parameter enforcement.

**Source:** [OpenRouter: Provider Routing documentation](https://openrouter.ai/docs/guides/routing/provider-selection)

---

## 4. Performance Traps

### PT1: Synchronous localStorage Blocking Main Thread
localStorage operations are synchronous and block the main thread. If you're reading/writing large state objects (wizard configuration can grow), you'll cause UI jank. Use Web Workers for heavy localStorage operations, or switch to IndexedDB (async) for large data.

**Source:** [web.dev: Storage for the web](https://web.dev/articles/storage-for-the-web)

### PT2: Re-rendering Entire Wizard on Each Keystroke
Without proper memoization, updating any field in a Zustand store can trigger re-renders across all wizard steps. Use Zustand selectors (`useStore(state => state.specificField)`) instead of subscribing to the entire store.

### PT3: Client-Side ZIP Generation for Large Outputs
JSZip holds the entire ZIP in memory. For SoulGen's use case (a few small markdown files), this is fine. But if you ever add features like including chat history, generated images, or multiple personality profiles, memory usage can spike. Monitor and set reasonable limits.

**Source:** [JSZip: Limitations](https://stuk.github.io/jszip/documentation/limitations.html)

### PT4: No Request Deduplication for LLM Calls
User double-clicks "Generate" button, two concurrent LLM API calls are made, both consume API credits. Implement request deduplication: disable the button during generation, use AbortController to cancel in-flight requests before starting new ones.

### PT5: Unnecessary SSR for Static Wizard Pages
Wizard steps that are purely client-side forms don't need server-side rendering. If i18n setup forces dynamic rendering for all pages (because of `useTranslations` in Server Components), every page load triggers a serverless function invocation, eating into the 150K/month limit.

---

## 5. Security Mistakes

### SM1: API Keys in URL Parameters or Client-Side Fetch Headers
Never send API keys as query parameters (`/api/generate?key=sk-...`) -- they appear in browser history, server logs, and referrer headers. Never set them as headers in client-side fetch calls -- they're visible in browser DevTools Network tab. Always send in the request body to your API route.

### SM2: No Rate Limiting on API Proxy Routes
Your Next.js API route proxies user-provided keys to LLM providers. Without rate limiting, a malicious user can spam your endpoint, causing:
- Your Vercel function invocations to spike
- Excessive bandwidth usage
- Potential Vercel account suspension for abuse
Implement rate limiting using in-memory counters or Vercel's built-in WAF (if available on your plan).

### SM3: Missing Input Validation on API Routes
The API route receives wizard configuration data and an API key, then constructs a prompt. Without validating inputs:
- Prompt injection: malicious wizard inputs could manipulate the system prompt
- Oversized payloads: user sends 10MB of configuration data, hitting Vercel limits
- Type confusion: expected string fields contain objects/arrays
Validate all inputs with Zod schemas before processing.

### SM4: No CSP Headers Configured
Default Next.js deployment has no Content Security Policy. Any injected script can access localStorage (and therefore API keys). Set strict CSP headers:
```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
```
Note: `unsafe-inline` for styles may be needed for some UI libraries but try to avoid it.

### SM5: CORS Misconfiguration on API Routes
If API routes have `Access-Control-Allow-Origin: *`, any website can call your proxy endpoints. Since the user's API key is sent in the body, a malicious site could craft requests to your endpoint with a stolen key. Set CORS to your own origin only.

---

## 6. UX Pitfalls

### UX1: Wizard Step Overload
Having too many steps (7+) with too many fields per step (6+) causes user fatigue and abandonment. Research shows each step should have 3-5 fields maximum. For SoulGen's personality DNA configuration, group related concepts into logical chunks and provide sensible defaults.

**Source:** [Growform: Multi-Step Form UX Best Practices](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)

### UX2: No Progress Indicator
Users need to know where they are in the process and how much is left. 67% of users prefer seeing progress information. Use a step indicator (e.g., "Step 2 of 5") AND a progress bar. Make it clear what each upcoming step involves.

**Source:** [Designlab: Multi-Step Forms UX](https://designlab.com/blog/design-multi-step-forms-enhance-user-experience)

### UX3: Back Navigation Forces Re-Validation of All Steps
When users go back to edit an earlier step, they should be able to jump directly to the step and return to where they were -- not click "Next" through every intermediate step again. Implement step-jumping for completed steps.

**Source:** [Chris Zempel: Solving the Wizard Problem](https://chriszempel.com/posts/thewizardproblem/)

### UX4: Generation Feels Stuck (No Streaming UI)
If LLM generation takes 10-30 seconds with no visual feedback, users assume the app is broken and either refresh (losing everything) or close the tab. Stream the generated content to the UI in real-time, showing each section as it's generated. At minimum, show an animated progress indicator with status messages ("Generating personality core...", "Creating identity matrix...").

### UX5: API Key Entry is Confusing
Users who are not developers may not understand what an API key is, where to get one, or which provider to choose. Provide:
- Clear explanation of what API keys are and why they're needed
- Direct links to API key creation pages for each provider
- Visual guides or screenshots
- A "test key" button that validates the key before proceeding
- Clear feedback on key format and validity

### UX6: No Draft/Resume Capability
If a user configures 80% of their personality DNA but needs to step away, they should be able to come back and finish. Without explicit save/resume, the wizard feels like a commitment rather than an exploration. Auto-save wizard state and show a "Resume previous session?" prompt on return.

### UX7: ZIP Download Provides No Preview
User clicks "Export as ZIP" and gets a file with no preview of what's inside. They have to download, unzip, and open each file to verify the output. Show a preview of generated files before export, with the option to regenerate individual files.

---

## 7. "Looks Done But Isn't" Checklist

These items are commonly skipped because they don't affect the "happy path" demo but cause real problems in production:

- [ ] **Error recovery after partial stream failure** -- What happens when the LLM stream drops at 60% completion? Is the partial output saved? Can the user retry from where it stopped?
- [ ] **localStorage quota handling** -- What happens when localStorage is full (5MB limit)? Do you catch `QuotaExceededError`? Do you have a cleanup strategy?
- [ ] **API key with insufficient credits** -- OpenAI returns a specific error when the key is valid but the account has no credits. Is this error caught and shown as a user-friendly message, not a generic "something went wrong"?
- [ ] **Rate limit handling per provider** -- Each provider returns rate limits differently. Are 429 responses caught and is the user told to wait (with the Retry-After duration)?
- [ ] **Browser private/incognito mode** -- Some browsers restrict or disable localStorage in private mode. Does the app gracefully detect this and warn the user?
- [ ] **Mobile browser behavior** -- Mobile browsers aggressively kill background tabs. If the user switches apps during generation, does the stream survive? (Usually no -- handle this.)
- [ ] **Multiple browser tabs** -- If the user opens the app in two tabs, do localStorage writes in one tab corrupt state in the other? Use the `storage` event to sync or lock.
- [ ] **Actual i18n completeness** -- Every user-facing string, including error messages, loading states, validation messages, and toast notifications, must be translated. Not just the wizard step labels.
- [ ] **Accessibility of wizard navigation** -- Can the wizard be navigated with keyboard only? Are step indicators ARIA-labeled? Do screen readers announce step transitions?
- [ ] **Generated markdown encoding** -- Do generated files handle special characters (Unicode names, emoji in personality traits) correctly when packed into a ZIP?
- [ ] **Empty/minimal input handling** -- What happens if a user skips optional fields? Does the LLM prompt handle sparse input gracefully, or does it hallucinate to fill gaps?
- [ ] **Vercel function invocation counting** -- Each streaming response counts as ONE invocation, but retries and validation calls also count. Monitor actual invocation usage.

---

## 8. Recovery Strategies

### RS1: Interrupted Stream Recovery
**Problem:** LLM stream dies mid-generation.
**Strategy:** Buffer all received chunks in client state. On interruption, show what was received so far and offer "Continue generation" button that sends the partial output as context in a new request with instructions to continue from where it stopped.

### RS2: Invalid API Key at Generation Time
**Problem:** User entered key during setup, but it's expired/revoked by the time they generate.
**Strategy:** Validate key with a lightweight API call before starting generation. Cache validation result for 5 minutes max. On failure, redirect to key management with a clear error message, preserving all wizard state.

### RS3: Provider Outage
**Problem:** OpenAI/Anthropic/OpenRouter is down.
**Strategy:** If user has keys for multiple providers, offer automatic fallback. Show provider status (link to status pages). Queue the request and allow retry. Never lose wizard input data.

### RS4: Quota Exceeded on localStorage
**Problem:** `QuotaExceededError` when saving wizard state.
**Strategy:** Catch the error. Offer to clear old/completed session data. Compress state data before storage (JSON.stringify + LZString compression). Consider moving large data to IndexedDB.

### RS5: Malformed LLM Output
**Problem:** Generated markdown fails validation.
**Strategy:** Auto-retry up to 2 times with increasingly explicit prompts. If still failing, show the raw output with a warning and let the user manually edit. Never silently serve broken output.

### RS6: Vercel Function Limit Approaching
**Problem:** Nearing 150K invocation limit mid-month.
**Strategy:** Track invocations client-side (rough estimate). Show a warning when approaching limits. Consider caching generated outputs so re-downloads don't trigger new function calls.

---

## 9. Pitfall-to-Phase Mapping

| Phase | Critical Pitfalls | Must Address Before Moving On |
|-------|------------------|-------------------------------|
| **Phase 0: Architecture** | P1 (Timeout), P2 (Key Security), P5 (Multi-Provider), IG1 (Hard Limits), IG4 (Runtime) | Streaming architecture decided, provider abstraction chosen, security model documented |
| **Phase 1: Project Setup & i18n** | P6 (i18n Redirects), TD5 (Translation Structure), IG3 (Cold Starts) | i18n working without redirect loops, middleware excluding API routes, translation namespace structure established |
| **Phase 2: Wizard UI** | P3 (State Loss), UX1-UX3 (Step Design), UX5 (Key Entry), UX6 (Drafts), PT2 (Re-renders) | State persists across refresh, progress indicator works, back navigation works, key validation works |
| **Phase 3: LLM Integration** | P4 (Output Consistency), P5 (Provider Differences), TD1 (Abstraction), TD4 (Monolithic Endpoint), SM1-SM3 (Security) | All three providers working with streaming, output validation passing, rate limiting in place |
| **Phase 4: Generation & Export** | P7 (Streaming Markdown), UX4 (Streaming UI), UX7 (Preview), PT3 (ZIP Memory), PT4 (Deduplication) | Streaming UI renders cleanly, ZIP export works, preview available, double-submit prevented |
| **Phase 5: Polish & Launch** | All "Looks Done But Isn't" items, SM4 (CSP), SM5 (CORS), RS1-RS6 (Recovery) | Error boundaries in place, all edge cases handled, recovery strategies implemented, security headers configured |

---

## 10. Source Summary with Confidence Levels

| Topic | Key Source | Confidence |
|-------|-----------|------------|
| Vercel timeout limits | [Vercel Docs: Function Duration](https://vercel.com/docs/functions/configuring-functions/duration) | HIGH -- official docs |
| Streaming as timeout workaround | [Vercel: Streaming from LLM](https://vercel.com/kb/guide/streaming-from-llm) | HIGH -- official recommendation |
| localStorage XSS vulnerability | [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html) | HIGH -- industry standard |
| Zustand hydration in Next.js | [Zustand GitHub Discussions](https://github.com/pmndrs/zustand/discussions/2897) | HIGH -- library maintainer guidance |
| LLM output parsing failures | [aider: LLMs bad at code in JSON](https://aider.chat/2024/08/14/code-in-json.html) | HIGH -- empirical testing |
| OpenAI vs Anthropic API differences | [eesel: API comparison guide](https://www.eesel.ai/blog/openai-api-vs-anthropic-api) | HIGH -- well-documented |
| i18n redirect loops | [Next.js GitHub Issue #55648](https://github.com/vercel/next.js/issues/55648) | HIGH -- confirmed bug |
| Vercel Hobby plan hard limits | [FlexPrice: Vercel pricing breakdown](https://flexprice.io/blog/vercel-pricing-breakdown) | HIGH -- verified against official pricing |
| Streaming markdown rendering issues | [Shopify: Sidekick streaming](https://shopify.engineering/sidekicks-improved-streaming) | MEDIUM -- specific implementation |
| Cold start impact on free tier | [Vercel: Cold start performance](https://vercel.com/kb/guide/how-can-i-improve-serverless-function-lambda-cold-start-performance-on-vercel) | MEDIUM -- varies by function size |
| Wizard UX field count limits | [Growform: Multi-step form UX](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/) | MEDIUM -- UX research, varies by context |
| OpenRouter parameter handling | [OpenRouter Docs: Provider Selection](https://openrouter.ai/docs/guides/routing/provider-selection) | HIGH -- official docs |
| JSZip memory limitations | [JSZip: Limitations](https://stuk.github.io/jszip/documentation/limitations.html) | HIGH -- official library docs |
| Multi-provider rate limit differences | [Requesty: Rate Limits for LLM Providers](https://www.requesty.ai/blog/rate-limits-for-llm-providers-openai-anthropic-and-deepseek) | MEDIUM -- third-party analysis |
| Prompt engineering for consistency | [Lakera: Prompt Engineering Guide](https://www.lakera.ai/blog/prompt-engineering-guide) | MEDIUM -- general best practices |
| Vercel AI SDK error handling | [AI SDK: Error Handling docs](https://ai-sdk.dev/docs/ai-sdk-core/error-handling) | HIGH -- official docs |
