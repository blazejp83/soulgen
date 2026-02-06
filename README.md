# SoulGen

**AI Agent Personality Wizard** — Create distinct, well-crafted agent personalities without writing a single line of markdown.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblazejp83%2Fsoulgen)

**[Try it live →](https://soulgen-mu.vercel.app/)**

---

## What is SoulGen?

SoulGen is a web-based wizard for the [OpenClaw](https://github.com/openclaw) community that lets you visually configure an AI agent's personality "DNA" through sliders, options, and presets — then generates ready-to-use personality files powered by your own LLM API key.

Think of it as a **character creator for AI agents**.

### Generated Files

SoulGen produces three markdown files that define your agent's identity:

| File | Purpose |
|------|---------|
| **SOUL.md** | Core behavioral philosophy, boundaries, and vibe. Written as a manifesto. |
| **IDENTITY.md** | Presentation metadata — name, creature type, emoji, avatar, personality descriptors. |
| **USER.md** | How the agent treats the user — communication preferences, language, relationship style. |

---

## Features

### Wizard Configuration

- **7-step wizard flow** — Archetype → Temperament → Communication → Work Style → User Relationship → Domains → Summary
- **8 archetype presets** — Developer, Researcher, Automation/DevOps, PM/Organizer, Coach, Storyteller, General Assistant, or Custom
- **Temperament sliders** — Valence, energy, warmth, dominance, stability, autonomy with 4 mood presets (Melancholic, Joyful, Angry, Haughty)
- **Communication style** — Formality, humor level, directness, response length, structure preference, jargon tolerance
- **Work style** — Default depth, explanation approach, tool usage, uncertainty handling
- **User relationship** — Address form, feedback style, proactivity level, response language
- **Domain specialization** — Select up to 3 priority areas from predefined options or add custom domains

### Generation & Export

- **Multi-provider LLM support** — OpenAI, Anthropic, or OpenRouter (bring your own API key)
- **Streaming generation** — Watch files generate in real-time with progress indicators
- **Markdown preview** — Rendered view, raw text, or edit mode with undo/redo
- **ZIP export** — Download all three files in one click
- **Shareable URLs** — Share your agent configuration via encoded link
- **Profile management** — Save, load, rename, and organize multiple agent profiles
- **JSON import/export** — Power user access to raw DNA configuration

### User Experience

- **Simple/Advanced mode** — Toggle between streamlined and full control
- **Dark mode** — Easy on the eyes, always
- **No account required** — Everything runs client-side with localStorage persistence
- **Zero cost** — You provide your own LLM API key

---

## Getting Started

### Use Online

Just visit **[soulgen-mu.vercel.app](https://soulgen-mu.vercel.app/)** — no installation required.

1. Go to **Settings** and add your API key (OpenAI, Anthropic, or OpenRouter)
2. Click **Get Started** to launch the wizard
3. Configure your agent's personality through the steps
4. Hit **Generate** to create your personality files
5. Preview, edit, and export your files

### Run Locally

```bash
# Clone the repository
git clone https://github.com/blazejp83/soulgen.git
cd soulgen

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **UI:** [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS v4](https://tailwindcss.com/)
- **State:** [Zustand](https://zustand-demo.pmnd.rs/) with localStorage persistence
- **LLM Integration:** [Vercel AI SDK](https://sdk.vercel.ai/) with streaming
- **Providers:** OpenAI, Anthropic, OpenRouter via AI SDK adapters
- **Hosting:** [Vercel](https://vercel.com/) (free tier compatible)

---

## Configuration

### API Keys

SoulGen requires an API key from one of the supported providers:

| Provider | Get API Key | Models |
|----------|-------------|--------|
| **OpenAI** | [platform.openai.com](https://platform.openai.com/api-keys) | GPT-4o, GPT-4o-mini, GPT-4-turbo |
| **Anthropic** | [console.anthropic.com](https://console.anthropic.com/) | Claude 3.5 Sonnet, Claude 3 Opus/Sonnet/Haiku |
| **OpenRouter** | [openrouter.ai](https://openrouter.ai/keys) | 100+ models from various providers |

API keys are stored in your browser's localStorage and proxied through the API route — they're never exposed in client-side network calls.

### Simple vs Advanced Mode

- **Simple mode** — Shows essential options for quick configuration
- **Advanced mode** — Reveals all sliders, raw JSON view, and fine-tuning controls

Toggle in the header or settings page.

---

## Project Structure

```
src/
├── app/
│   ├── api/chat/       # Streaming LLM proxy route
│   ├── settings/       # API key & provider configuration
│   ├── wizard/         # Main wizard flow
│   └── page.tsx        # Landing page
├── components/
│   ├── ui/             # shadcn/ui components
│   ├── wizard/         # Wizard shell and step components
│   ├── file-preview.tsx
│   ├── generation-view.tsx
│   └── ...
├── hooks/
│   ├── use-generation.ts
│   ├── use-file-history.ts
│   └── use-mounted.ts
├── lib/
│   ├── providers.ts    # LLM provider adapters
│   ├── prompt-builder.ts
│   ├── parse-generation.ts
│   └── export.ts
├── stores/
│   ├── settings-store.ts
│   ├── wizard-store.ts
│   └── profile-store.ts
└── types/
    └── index.ts        # TypeScript interfaces
```

---

## How It Works

1. **DNA Configuration** — The wizard collects your choices into an `AgentDNA` JSON object
2. **Prompt Building** — `buildGenerationPrompt()` transforms DNA into detailed LLM instructions
3. **Streaming Generation** — Request is sent to `/api/chat` which proxies to your chosen LLM provider
4. **Response Parsing** — `GenerationParser` splits the streamed response into three files using delimiters
5. **Preview & Export** — View rendered markdown, make edits, and export as ZIP or shareable URL

---

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fblazejp83%2Fsoulgen)

Or manually:

1. Fork/clone this repository
2. Import to [Vercel](https://vercel.com/new)
3. Deploy with default settings (Next.js auto-detected)

No environment variables required — users provide their own API keys.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## License

MIT

---

## Acknowledgments

Built for the [OpenClaw](https://github.com/openclaw) community.

---

<p align="center">
  <a href="https://soulgen-mu.vercel.app/">
    <strong>Create Your Agent →</strong>
  </a>
</p>
