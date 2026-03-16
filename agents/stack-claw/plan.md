# Claw-like Agent POC

Replicate OpenClaw's self-learning and self-scheduling in AgentStack using Pi SDK.

## Architecture

Embed Pi SDK (`@mariozechner/pi-coding-agent`) inside an AgentStack TS agent. Pi provides the agent runtime (LLM, tools, sessions). AgentStack provides scheduling (heartbeat), deployment, and conversation persistence.

Two persistence layers:
- **Conversation history** → AgentStack context API (PostgreSQL, visible in UI)
- **Self-learning artifacts** → filesystem (markdown files)

```
AgentStack UI conversation
        ↕ (context API)
Custom SessionManager (adapter)
        ↕
Pi agent runtime
        ↕ (built-in tools)
Filesystem (.agentstack/ workspace)
```

### Workspace isolation

Each context (conversation) gets its own workspace directory scoped by `contextId`. Pi's `cwd` is set to this directory so its built-in tools (`read`/`write`/`edit`/`bash`) operate in isolation.

```
/workspace/<contextId>/
├── IDENTITY.md        # agent personality, evolves over time
├── MEMORY.md          # accumulated facts and learnings
├── DIARY.md           # timestamped run summaries
└── HEARTBEAT.md       # scheduled task checklist
```

## 1. Self-Learning

- `MEMORY.md` — agent appends facts/learnings, read at start of each run
- `DIARY.md` — after each heartbeat, agent appends timestamped summary of what it checked/did/learned
- `IDENTITY.md` — seeded with initial instructions, agent evolves it over time, included in system prompt
- Pi's built-in `read`/`write`/`edit` tools handle all file operations

## 2. Self-Scheduling (Heartbeat)

- `HEARTBEAT.md` — markdown checklist, agent reads each tick, acts on items, marks one-time tasks `[x]`
- Scheduler: `setInterval` inside the agent process (no Procrastinate dependency for POC)
- Config via env vars: `HEARTBEAT_INTERVAL_MS` (default 30min), `HEARTBEAT_CONTEXT_ID`
- **Two-phase execution** to avoid polluting memory on no-op ticks:
  1. **Triage phase**: cheap LLM call reads `HEARTBEAT.md`, returns `HEARTBEAT_OK` or `HEARTBEAT_ACTION_NEEDED`
  2. **Action phase**: only if triage returns `HEARTBEAT_ACTION_NEEDED`, spin up a full Pi session — act on items, write to diary, persist to context history
  - If triage returns `HEARTBEAT_OK`, nothing is persisted — no diary entry, no context history, no session created

## 3. Pi SDK Integration

### Custom SessionManager

Implement a custom `SessionManager` that bridges Pi sessions ↔ AgentStack contexts:
- **1 AgentStack context = 1 Pi session** — `contextId` is the session identity
- **Write path**: Pi appends message → store in AgentStack context history via platform API
- **Read path**: Pi builds session context → load from AgentStack context history
- Conversation history is persistent across runs and visible in AgentStack UI

### Custom AuthStorage

Custom `AuthStorage` that reads LLM keys from env vars (no `auth.json` file dependency).
OpenAI only for POC. AgentStack's LLM extension is not used — avoids coupling with heartbeat execution where there's no user-initiated request to derive model config from.

```
.env
OPENAI_API_KEY=sk-...
```

### System Prompt via ResourceLoader

Use `DefaultResourceLoader` with `systemPromptOverride` to inject self-learning/heartbeat behavioral rules into the system prompt. These are persistent instructions, not conversational messages.

`session.prompt()` is for user-level messages only (actual user input or heartbeat trigger).

### Agent entry point

```typescript
import { server } from "agentstack-sdk-ts";
import { createAgentSession, DefaultResourceLoader, ModelRegistry } from "@mariozechner/pi-coding-agent";
import { AgentStackSessionManager } from "./session-manager";
import { EnvAuthStorage } from "./auth-storage";

const SYSTEM_PROMPT = `You are a self-learning agent with persistent memory.

On every run:
- Read MEMORY.md for accumulated knowledge
- Read IDENTITY.md for your personality and learned preferences
- After completing work, append new learnings to MEMORY.md

When triggered by a heartbeat:
- Read HEARTBEAT.md and act on each unchecked item
- Mark one-time tasks [x] when done
- Append a timestamped summary to DIARY.md
`;

server.agent(async function* (input, ctx) {
  const authStorage = new EnvAuthStorage();
  const sessionManager = new AgentStackSessionManager(ctx.contextId);
  const loader = new DefaultResourceLoader({
    systemPromptOverride: () => SYSTEM_PROMPT,
  });
  await loader.reload();

  const cwd = `/workspace/${ctx.contextId}`;
  const { session } = await createAgentSession({
    cwd,
    sessionManager,
    authStorage,
    modelRegistry: new ModelRegistry(authStorage),
    resourceLoader: loader,
  });

  const response = await session.prompt(input.parts[0].text);
  yield { text: response };
});
```

## SDK Compatibility Notes

- **Signal handlers**: Both AgentStack and Pi register `SIGTERM`/`SIGINT` handlers. Pi's session cleanup should be registered inside AgentStack's existing cleanup hook to avoid conflicts.
- **Tool registration**: No conflict — Pi's tools (read/write/edit/bash) are internal to its session, AgentStack's are A2A extensions. Different layers.
- **Concurrency**: Safe — both are async/await on the same Node.js event loop.

## Unresolved Questions

None — all resolved for POC scope.
