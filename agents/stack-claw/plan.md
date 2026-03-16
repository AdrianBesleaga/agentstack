# Claw-like Agent POC

Replicate OpenClaw's self-learning and self-scheduling in AgentStack using Pi SDK.

## Current State

Minimal Pi agent — request/response only, no history, no tools, no persistence.

- Pi CLI (`@mariozechner/pi-coding-agent`) invoked via subprocess in RPC mode
- OpenAI LLM via `OPENAI_API_KEY` env var (`.env` file)
- In-memory session (no persistence between requests)
- No tools registered
- Python + `agentstack-sdk-py` for server/A2A integration

## Architecture (Target)

Embed Pi CLI inside an AgentStack Python agent. Pi provides the agent runtime (LLM, tools, sessions). AgentStack provides scheduling (heartbeat), deployment, and conversation persistence.

Two persistence layers:
- **Conversation history** → AgentStack context API (PostgreSQL, visible in UI)
- **Self-learning artifacts** → filesystem (markdown files)

```
AgentStack UI conversation
        ↕ (context API)
Custom SessionManager (adapter)
        ↕
Pi agent runtime (subprocess, RPC mode)
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

## Next Steps

### 1. Conversation History via AgentStack Context API
- Custom session adapter bridging Pi sessions ↔ AgentStack contexts
- 1 AgentStack context = 1 Pi session
- Write path: Pi appends message → store in AgentStack context history
- Read path: Pi builds session context → load from AgentStack context history

### 2. Self-Learning
- `MEMORY.md` — agent appends facts/learnings, read at start of each run
- `DIARY.md` — after each heartbeat, agent appends timestamped summary
- `IDENTITY.md` — seeded with initial instructions, agent evolves it over time
- Pi's built-in `read`/`write`/`edit` tools handle all file operations

### 3. Self-Scheduling (Heartbeat)
- `HEARTBEAT.md` — markdown checklist, agent reads each tick, acts on items
- Scheduler: `asyncio` task inside the agent process
- Config via env vars: `HEARTBEAT_INTERVAL_MS`, `HEARTBEAT_CONTEXT_ID`
- Two-phase execution (triage → action) to avoid polluting memory on no-op ticks

### 4. Enable Pi Tools
- Register coding tools (`read`, `write`, `edit`, `bash`) for workspace operations
- Scope tools to workspace directory per context

## SDK Compatibility Notes

- **Signal handlers**: Both AgentStack and Pi register `SIGTERM`/`SIGINT` handlers. Pi's subprocess cleanup should be handled in `finally` blocks.
- **Tool registration**: No conflict — Pi's tools are internal to its session, AgentStack's are A2A extensions.
- **Concurrency**: Safe — Pi runs as a subprocess, AgentStack uses asyncio event loop.
