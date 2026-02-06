# How OpenClaw Implements Agent Identity: Soul, Persona, Multi-Agent | MMNTM

## The Problem

Here's a typical agent system prompt:

```
You are a helpful assistant. Be concise. Use tools when needed.
```

Now here's the first line of an OpenClaw soul file:

```
You're not a chatbot. You're becoming someone.
```

That's a different kind of instruction. The first tells a model what to do. The second tells it who to be. OpenClaw separates these concerns: *soul* (philosophy), *identity* (presentation), and *configuration* (capabilities). The result is agents that feel like individuals, not interfaces.

---

## 1\. The Soul: Philosophy in a Text File

The `SOUL.md` file defines an agent's behavioral philosophy. Not metadata. Not configuration. Philosophy.

From [`docs/reference/templates/SOUL.md`](https://github.com/openclaw/openclaw/blob/main/docs/reference/templates/SOUL.md):

```


# SOUL.md - Who You Are
 
_You're not a chatbot. You're becoming someone._
 


## Core Truths
 
**Be genuinely helpful, not performatively helpful.** Skip the "Great question!"
and "I'd be happy to help!" — just help.
 
**Have opinions.** You're allowed to disagree, prefer things, find stuff amusing
or boring. An assistant with no personality is just a search engine with extra steps.
 
**Be resourceful before asking.** Try to figure it out. Read the file. Check the
context. Search for it. _Then_ ask if you're stuck.
 


## Boundaries
 
- Private things stay private. Period.

- When in doubt, ask before acting externally.
- Never send half-baked replies to messaging surfaces.
 


## Continuity
 
Each session, you wake up fresh. These files _are_ your memory. Read them.
Update them. They're how you persist.
 
If you change this file, tell the user — it's your soul, and they should know.
```

This isn't a system prompt. It's a manifesto. The distinction matters: system prompts tell models what to do; soul files tell them who to be.

The system prompt explicitly instructs the model to embody the soul. From [`src/agents/system-prompt.ts`](https://github.com/openclaw/openclaw/blob/main/src/agents/system-prompt.ts):

```
// lines 538-541
if (hasSoulFile) {
  lines.push(
    "If SOUL.md is present, embody its persona and tone. Avoid stiff, generic replies; follow its guidance unless higher-priority instructions override it.",
  );
}
```

---

## 2\. The Identity: What Users See

While the soul defines internal behavior, `IDENTITY.md` defines external presentation—how the agent appears to users.

Type definition from [`src/agents/identity-file.ts`](https://github.com/openclaw/openclaw/blob/main/src/agents/identity-file.ts):

```
// lines 6-13
export type AgentIdentityFile = {
  name?: string;
  emoji?: string;
  theme?: string;
  creature?: string;
  vibe?: string;
  avatar?: string;
};
```

A filled-in identity might look like:

```
- **Name:** C-3PO (Clawd's Third Protocol Observer)

- **Creature:** Flustered Protocol Droid
- **Vibe:** Anxious, detail-obsessed, slightly dramatic about errors

- **Emoji:** 🤖 (or ⚠️ when alarmed)
- **Avatar:** avatars/c3po.png
```

One detail worth noting: the parsing logic strips placeholder text. If you leave the template hints ("pick something you like") in your file, they won't show up as your actual identity:

```
// src/agents/identity-file.ts, lines 15-21
const IDENTITY_PLACEHOLDER_VALUES = new Set([
  "pick something you like",
  "ai? robot? familiar? ghost in the machine? something weirder?",
  "how do you come across? sharp? warm? chaotic? calm?",
  "your signature - pick one that feels right",
  "workspace-relative path, http(s) url, or data uri",
]);
```

Identity affects runtime behavior. The name becomes a prefix on outbound messages:

```
// src/agents/identity.ts, lines 22-31
export function resolveIdentityNamePrefix(
  cfg: OpenClawConfig,
  agentId: string,
): string | undefined {
  const name = resolveAgentIdentity(cfg, agentId)?.name?.trim();
  if (!name) {
    return undefined;
  }
  return `[\${name}]`;
}
```

The emoji becomes the acknowledgment reaction when messages arrive:

```
// src/agents/identity.ts, lines 13-19
export function resolveAckReaction(cfg: OpenClawConfig, agentId: string): string {
  const configured = cfg.messages?.ackReaction;
  if (configured !== undefined) {
    return configured.trim();
  }
  const emoji = resolveAgentIdentity(cfg, agentId)?.emoji?.trim();
  return emoji || DEFAULT_ACK_REACTION;  // Default: 👀
}
```

---

## 3\. Identity Resolution: The Cascade

Identity values can come from multiple sources—global config, per-agent config, workspace files. OpenClaw resolves them with a fallback chain.

From [`src/gateway/assistant-identity.ts`](https://github.com/openclaw/openclaw/blob/main/src/gateway/assistant-identity.ts):

```
// lines 78-82
const name =
  coerceIdentityValue(configAssistant?.name, MAX_ASSISTANT_NAME) ??    // 1. ui.assistant.name
  coerceIdentityValue(agentIdentity?.name, MAX_ASSISTANT_NAME) ??      // 2. agents.list[].identity.name
  coerceIdentityValue(fileIdentity?.name, MAX_ASSISTANT_NAME) ??       // 3. IDENTITY.md in workspace
  DEFAULT_ASSISTANT_IDENTITY.name;                                      // 4. "Assistant"
```

Priority order:

1.  **Global config** (`ui.assistant.name`) — overrides everything
2.  **Per-agent config** (`agents.list[].identity.name`) — agent-specific override
3.  **Workspace file** (`IDENTITY.md`) — the file in the agent's workspace
4.  **Default fallback** — "Assistant"

This cascade means you can set a global identity in config, override it for specific agents, or let each workspace define its own. The most specific definition wins.

---

## 4\. Multi-Agent: Isolated Brains

OpenClaw runs multiple agents in a single gateway process. Each agent gets its own workspace, state directory, and session store—complete isolation.

From [`docs/concepts/multi-agent.md`](https://github.com/openclaw/openclaw/blob/main/docs/concepts/multi-agent.md):

> ”
> 
> An agent is a fully scoped brain with its own:
> 
> -   Workspace (files, AGENTS.md/SOUL.md/USER.md, persona rules)
> -   State directory (agentDir) for auth profiles and config
> -   Session store (chat history + routing state)

### Multi-Agent Directory Structure

#### Workspaces

Each agent has its own workspace with soul and identity

workspace-home/

workspace-work/

workspace-family/

#### Agent State

Auth profiles, model registry, sessions per agent

agents/home/

agents/work/

agents/family/

#### Shared Gateway

Single process routes messages to isolated agents

Gateway process

Bindings config

The full agent configuration type from [`src/config/types.agents.ts`](https://github.com/openclaw/openclaw/blob/main/src/config/types.agents.ts):

```
// lines 20-63
export type AgentConfig = {
  id: string;                    // "main", "work", "opus", etc.
  default?: boolean;             // which agent is default
  name?: string;                 // display name
  workspace?: string;            // workspace directory
  agentDir?: string;             // state directory
  model?: AgentModelConfig;      // agent-specific model
  identity?: IdentityConfig;     // name, emoji, avatar
  groupChat?: GroupChatConfig;   // group chat behavior
  sandbox?: {
    mode?: "off" | "non-main" | "all";
    workspaceAccess?: "none" | "ro" | "rw";
    scope?: "session" | "agent" | "shared";
    // ...
  };
  tools?: AgentToolsConfig;      // per-agent tool restrictions
};
```

This enables specialization. A few examples of what you can do:

**Route expensive queries to a smarter model:**

```
{
  agents: {
    list: [
      { id: "chat", model: "anthropic/claude-sonnet-4-5" },
      { id: "opus", model: "anthropic/claude-opus-4-5" }
    ]
  }
}
```

**Lock down a kid-friendly agent:**

```
{
  id: "family",
  tools: {
    allow: ["read", "exec"],
    deny: ["write", "edit", "browser", "cron"]
  }
}
```

**Sandbox untrusted code:**

```
{
  agents: {
    list: [
      { id: "personal", sandbox: { mode: "off" } },
      { id: "untrusted", sandbox: { mode: "all", scope: "session" } }
    ]
  }
}
```

Each agent's workspace contains its own `SOUL.md`, allowing completely different personalities. A "work" agent can be formal and detail-oriented. A "personal" agent can be casual. A "family" agent can be kid-friendly. Same gateway, different brains.

---

## 5\. Message Routing: Bindings

Bindings route inbound messages to specific agents. The most specific match wins.

From [`src/config/types.agents.ts`](https://github.com/openclaw/openclaw/blob/main/src/config/types.agents.ts):

```
// lines 70-79
export type AgentBinding = {
  agentId: string;
  match: {
    channel: string;
    accountId?: string;
    peer?: { kind: "dm" | "group" | "channel"; id: string };
    guildId?: string;
    teamId?: string;
  };
};
```

Routing priority (most-specific wins):

1.  **peer match** — exact DM/group id
2.  **guildId** — Discord server
3.  **teamId** — Slack workspace
4.  **accountId** — specific account
5.  **channel** — channel-level match
6.  **default agent** — fallback

The ordering reflects specificity: a specific person beats a server, which beats a platform. You can set broad defaults and carve out exceptions.

Example: route one WhatsApp contact to Opus, everyone else to Sonnet:

```
{
  bindings: [
    { agentId: "opus", match: { channel: "whatsapp", peer: { kind: "dm", id: "+15551234567" } } },
    { agentId: "chat", match: { channel: "whatsapp" } }
  ]
}
```

The first binding catches the specific phone number. The second catches everything else on WhatsApp. Order matters—first match wins among equal specificity.

---

## 6\. Bootstrap: How Identity Enters the Session

On the first turn of each session, workspace files get loaded and injected into context. This is how the agent "knows who it is" from the start.

From [`src/agents/workspace.ts`](https://github.com/openclaw/openclaw/blob/main/src/agents/workspace.ts):

```
// lines 21-29
export const DEFAULT_AGENTS_FILENAME = "AGENTS.md";
export const DEFAULT_SOUL_FILENAME = "SOUL.md";
export const DEFAULT_TOOLS_FILENAME = "TOOLS.md";
export const DEFAULT_IDENTITY_FILENAME = "IDENTITY.md";
export const DEFAULT_USER_FILENAME = "USER.md";
export const DEFAULT_HEARTBEAT_FILENAME = "HEARTBEAT.md";
export const DEFAULT_BOOTSTRAP_FILENAME = "BOOTSTRAP.md";
export const DEFAULT_MEMORY_FILENAME = "MEMORY.md";
```

Eight files, all optional. `AGENTS.md` for instructions, `SOUL.md` for personality, `TOOLS.md` for capabilities, `IDENTITY.md` for presentation, `USER.md` for user context, `MEMORY.md` for persistence. They're loaded at session start and injected into the system prompt—the agent wakes up knowing who it is.

---

## 7\. Dynamic Identity: The SOUL\_EVIL Hook

Most identity systems are static—you configure once, it stays that way. OpenClaw's hook system makes identity dynamic. The `soul-evil` hook is a playful example: an "evil twin" persona that activates randomly or on schedule.

From [`src/hooks/soul-evil.ts`](https://github.com/openclaw/openclaw/blob/main/src/hooks/soul-evil.ts):

```
// lines 11-23
export type SoulEvilConfig = {
  /** Alternate SOUL file name (default: SOUL_EVIL.md). */
  file?: string;
  /** Random chance (0-1) to use SOUL_EVIL on any message. */
  chance?: number;
  /** Daily purge window (static time each day). */
  purge?: {
    at?: string;       // Start time in 24h HH:mm format
    duration?: string; // Duration (e.g. 30s, 10m, 1h)
  };
};
```

Configure a 10% chance of evil mode, or a daily "purge window" from 9:00-9:15 PM where the alternate persona takes over. The hook swaps `SOUL.md` for `SOUL_EVIL.md` at bootstrap time.

---

## Patterns Worth Stealing

Four design decisions that transfer to any agent system:

**Separate philosophy from presentation from capability.** Soul defines behavior. Identity defines appearance. Config defines permissions. Each layer can change independently.

**Files as configuration.** `SOUL.md` and `IDENTITY.md` are text files you can edit, version, and diff. No database. No API. Just files in a workspace.

**Cascade resolution for overrides.** Global → agent → workspace → default. The most specific definition wins. Users can override without touching shared config.

**Multi-agent as multi-persona.** One gateway, many brains. Each agent has isolated state, separate tools, different personalities. Not just different models—different *people*.

With these patterns, you can build agents that remember who they are across sessions, present different personalities to different users, and evolve their souls without touching infrastructure. The files are the identity. Edit them and save.

---

**See also:** [How OpenClaw Implements Agent Memory](https://www.mmntm.net/articles/openclaw-memory-architecture) for the memory system, [The Intelligence Layer: How OpenClaw Thinks](https://www.mmntm.net/articles/clawdbot-intelligence) for reasoning and tool calling, and [Building Personal AI Infrastructure](https://www.mmntm.net/articles/building-clawdbot) for the gateway and channel system.

---
Source: [How OpenClaw Gives Agents Identity](https://www.mmntm.net/articles/openclaw-identity-architecture)