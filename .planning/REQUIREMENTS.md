# Requirements: SoulGen

**Defined:** 2026-02-05
**Core Value:** Anyone can create a distinct, well-crafted agent personality without writing a single line of markdown — just configure sliders and options, hit generate, and get files that make an OpenClaw agent feel like a real individual.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Wizard Flow

- [ ] **WIZD-01**: User sees a multi-step wizard with labeled steps and visual progress indicator
- [ ] **WIZD-02**: User can navigate back to any completed step without losing data
- [ ] **WIZD-03**: User can navigate forward/backward with Next and Back buttons
- [ ] **WIZD-04**: User sees a summary/review step showing complete configuration before generation
- [ ] **WIZD-05**: User can freely edit generated files in an editor before downloading

### Archetype Selection

- [ ] **ARCH-01**: User can select from 7 predefined archetype cards (Developer, Researcher, DevOps, PM/Organizer, Coach, Storyteller, General Assistant)
- [ ] **ARCH-02**: Each archetype card shows icon, name, description, and tags
- [ ] **ARCH-03**: Selecting an archetype pre-fills subsequent wizard options as defaults
- [ ] **ARCH-04**: User can start from scratch without selecting an archetype
- [ ] **ARCH-05**: User can override archetype-set values in later wizard steps
- [ ] **ARCH-06**: Custom or modified archetypes are saved to localStorage for reuse

### Temperament

- [ ] **TEMP-01**: User can configure 5 bipolar sliders: valence (pessimistic↔optimistic), energy (calm↔energized), warmth (cold↔empathetic), dominance (gentle↔assertive), emotional stability (reactive↔stable)
- [ ] **TEMP-02**: Sliders default to center (neutral) position with labeled endpoints
- [ ] **TEMP-03**: User can apply temperament presets (Melancholic, Joyful, Angry, Haughty) that set slider values
- [ ] **TEMP-04**: Applying a preset pre-fills sliders but allows manual adjustment afterward
- [ ] **TEMP-05**: User can configure an autonomy slider: dependent (does only what's told) ↔ independent (acts proactively, makes assumptions, takes initiative)

### Communication Style

- [ ] **COMM-01**: User can configure formality level
- [ ] **COMM-02**: User can configure humor level (0-5 scale)
- [ ] **COMM-03**: User can configure directness level
- [ ] **COMM-04**: User can configure preferred response length
- [ ] **COMM-05**: User can configure structure preference (prose vs. lists/headers)
- [ ] **COMM-06**: User can configure jargon/technical language level

### Work Style

- [ ] **WORK-01**: User can configure default depth (overview ↔ deep dive)
- [ ] **WORK-02**: User can configure explanation style
- [ ] **WORK-03**: User can configure tool usage preference
- [ ] **WORK-04**: User can configure uncertainty tolerance

### User Relationship

- [ ] **USER-01**: User can configure address form (how the agent addresses the user)
- [ ] **USER-02**: User can configure feedback style
- [ ] **USER-03**: User can configure proactivity level
- [ ] **USER-04**: User can set agent response language (saved in USER.md)

### Domain Selection

- [ ] **DOMN-01**: User can select multiple domain tags (Coding, Research, Automation, Writing, Planning, Media)
- [ ] **DOMN-02**: User can mark up to 2-3 domains as primary/priority
- [ ] **DOMN-03**: Selected domains influence generation output (mentioned in SOUL.md)

### LLM Generation

- [ ] **GENR-01**: System sends DNA payload to selected LLM provider and receives generated SOUL.md, IDENTITY.md, and USER.md
- [ ] **GENR-02**: Generation uses streaming to handle Vercel timeout constraints
- [ ] **GENR-03**: User sees generation progress/streaming feedback during file creation

### Multi-Provider Support

- [ ] **PROV-01**: User can select from OpenAI, Anthropic, or OpenRouter as LLM provider
- [ ] **PROV-02**: User can select a model from the chosen provider (hardcoded list for OpenAI/Anthropic, dynamic via API for OpenRouter)
- [ ] **PROV-03**: API keys are proxied through server-side API routes (never exposed in client network calls)

### File Preview & Editing

- [ ] **PREV-01**: User sees generated files in a tabbed view (SOUL.md | IDENTITY.md | USER.md)
- [ ] **PREV-02**: User can toggle between rendered markdown and raw edit mode
- [ ] **PREV-03**: User can edit file contents directly before export
- [ ] **PREV-04**: User can copy individual file contents to clipboard
- [ ] **PREV-05**: Session-local version history per file (undo/redo within the session)

### Export

- [ ] **EXPO-01**: User can download all generated files as a ZIP
- [ ] **EXPO-02**: User can copy individual files to clipboard
- [ ] **EXPO-03**: Exported files follow naming convention (SOUL.md, IDENTITY.md, USER.md)

### API Key Management

- [ ] **AKEY-01**: User can enter API key for selected provider
- [ ] **AKEY-02**: API key input has show/hide toggle
- [ ] **AKEY-03**: Key is stored in localStorage with clear privacy messaging
- [ ] **AKEY-04**: User can switch providers and manage keys per provider

### Persistence

- [ ] **PERS-01**: Wizard state auto-saves to localStorage on every step change
- [ ] **PERS-02**: Wizard state restores on page load (resume where user left off)
- [ ] **PERS-03**: User can save multiple agent profiles to localStorage
- [ ] **PERS-04**: User can load a previously saved agent profile
- [ ] **PERS-05**: User can import DNA configuration from JSON paste or file upload
- [ ] **PERS-06**: User can share agent configuration via URL (base64-encoded DNA in query params)
- [ ] **PERS-07**: User can load a shared configuration from a URL

### Mode Toggle

- [ ] **MODE-01**: User can switch between Simple and Advanced mode
- [ ] **MODE-02**: Simple mode shows key parameters only; Advanced reveals all settings
- [ ] **MODE-03**: Switching to Simple does not delete Advanced values
- [ ] **MODE-04**: Selected mode persists across sessions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### i18n

- **I18N-01**: Polish language UI
- **I18N-02**: Language switcher in UI

### Generation Enhancements

- **GENX-01**: Per-section regeneration (regenerate one file while keeping others)
- **GENX-02**: Live personality summary (template-based, updates in real-time without LLM calls)

### Export Enhancements

- **EXPX-01**: OpenClaw config snippet export (openclaw.json agent entries)

### Community

- **CMTY-01**: Agent chat preview (test personality with mini chat interface)
- **CMTY-02**: Community preset gallery (GitHub-backed, no backend needed)
- **CMTY-03**: Clone/fork existing agent profiles

### Advanced Features

- **ADVX-01**: Per-paragraph regeneration
- **ADVX-02**: Diff view between file versions
- **ADVX-03**: Alternative export formats (ElizaOS character files, SillyTavern cards)
- **ADVX-04**: Custom archetype creation (beyond modifying existing ones)
- **ADVX-05**: Token cost estimation before generation
- **ADVX-06**: Keyboard shortcuts throughout wizard

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User accounts / authentication | No backend, users bring their own API keys |
| Server-side storage / database | localStorage only, zero ongoing cost |
| Real OpenClaw integration / plugin system | Just generates files for manual use |
| Mobile-native app | Web-responsive is sufficient |
| Agent orchestration / runtime | Personality file generator, not an agent runtime |
| Visual avatar generation | Requires image generation API, different billing/complexity |
| Agent-to-agent conversation simulation | Doubles API costs, beyond scope of file generator |
| Granular sliders beyond ~6 temperament | Slider fatigue, weak mapping to actual LLM behavior |
| Free-form "describe your agent" as primary input | Produces inconsistent DNA, structured wizard is the value |
| Real-time LLM-powered slider descriptions | Expensive, slow, requires valid API key during configuration |
| Sycophancy / agreeableness slider | Handled indirectly through warmth and directness; explicit control is harmful |

## Traceability

Which phases cover which requirements. Updated by create-roadmap.

| Requirement | Phase | Status |
|-------------|-------|--------|
| — | — | Pending |

**Coverage:**
- v1 requirements: 53 total
- Mapped to phases: 0
- Unmapped: 53 ⚠️

---
*Requirements defined: 2026-02-05*
*Last updated: 2026-02-05 after initial definition*
