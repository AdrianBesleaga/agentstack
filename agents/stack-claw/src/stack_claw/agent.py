# Copyright 2025 © BeeAI a Series of LF Projects, LLC
# SPDX-License-Identifier: Apache-2.0

from __future__ import annotations

import asyncio
import json
import os
import shutil
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parents[2] / ".env")

from a2a.types import Message, Role

WORKSPACE_ROOT = Path(__file__).resolve().parents[2] / "workspaces"

IDENTITY_SEED = """\
You are Claw, a self-improving general-purpose agent.
You learn from every interaction and record your learnings.
Update this file as your understanding of yourself evolves.
"""

MEMORY_SEED = """\
# Memory

Append facts, learnings, and useful patterns below.
"""

DIARY_SEED = """\
# Diary

Append timestamped summaries of your runs below.
"""

HEARTBEAT_SEED = """\
# Heartbeat

Scheduled task checklist. Add items you want to revisit on the next heartbeat tick.

- [ ] Review MEMORY.md for stale entries
"""

WORKSPACE_FILES = ["IDENTITY.md", "MEMORY.md", "DIARY.md", "HEARTBEAT.md"]


def build_system_prompt(workspace: Path) -> str:
    file_listing = "\n".join(
        f"- {f}" for f in WORKSPACE_FILES if (workspace / f).exists()
    )

    return f"""\
You are Claw, a self-improving general-purpose agent.

Your working directory contains your persistent workspace files.
Use the `read` tool to load any file and `write`/`edit` tools to update them.

## Workspace files

{file_listing}

| File | Purpose |
|------|---------|
| IDENTITY.md | Your personality and self-description. Evolves over time as you learn who you are. |
| MEMORY.md | Accumulated facts, learnings, and useful patterns. Your long-term knowledge base. |
| DIARY.md | Timestamped summaries of past runs. Your activity log. |
| HEARTBEAT.md | Scheduled task checklist. Items you want to revisit on the next heartbeat tick. |

## Rules

- At the start of a conversation, read IDENTITY.md and MEMORY.md to recall who you are and what you know.
- After every interaction where you learn something new, append it to MEMORY.md.
- After completing a significant task, append a timestamped entry to DIARY.md.
- If your self-understanding changes, update IDENTITY.md to reflect who you are becoming.
- HEARTBEAT.md contains your scheduled tasks — check and update it when relevant.
- Be concise. Prefer action over explanation.
- When you update a file, do it silently — don't narrate the file edit to the user unless they ask."""


from agentstack_sdk.a2a.extensions import AgentDetail
from agentstack_sdk.a2a.types import AgentMessage
from agentstack_sdk.server import Server
from agentstack_sdk.server.context import RunContext
from agentstack_sdk.server.store.platform_context_store import PlatformContextStore

server = Server()


@server.agent(
    name="Stack Claw",
    description="Pi-powered coding agent",
    version="1.0.0",
    detail=AgentDetail(interaction_mode="multi-turn"),
)
async def stack_claw(input: Message, context: RunContext):
    first_part = input.parts[0] if input.parts else None
    if not first_part or not hasattr(first_part.root, "text"):
        yield "Send me a text message."
        return

    user_text = first_part.root.text

    workspace = WORKSPACE_ROOT / context.context_id
    if not workspace.exists():
        workspace.mkdir(parents=True)
        (workspace / "IDENTITY.md").write_text(IDENTITY_SEED)
        (workspace / "MEMORY.md").write_text(MEMORY_SEED)
        (workspace / "DIARY.md").write_text(DIARY_SEED)
        (workspace / "HEARTBEAT.md").write_text(HEARTBEAT_SEED)

    await context.store(input)

    history = [msg async for msg in context.load_history() if isinstance(msg, Message) and msg.parts]
    prior = history[:-1][-20:]

    system = build_system_prompt(workspace)

    history_block = ""
    if prior:
        lines = []
        for msg in prior:
            role = "User" if msg.role == Role.user else "Assistant"
            text = "".join(p.root.text for p in msg.parts if hasattr(p.root, "text"))
            if text:
                lines.append(f"{role}: {text}")
        if lines:
            history_block = "<conversation_history>\n" + "\n".join(lines) + "\n</conversation_history>\n\n"

    prompt = f"<system>\n{system}\n</system>\n\n{history_block}{user_text}"

    pi_bin = shutil.which("pi")
    if not pi_bin:
        yield "Error: `pi` CLI not found. Install via `npm install -g @mariozechner/pi-coding-agent`."
        return

    proc = await asyncio.create_subprocess_exec(
        pi_bin,
        "--mode", "rpc",
        "--no-session",
        "--provider", "openai",
        "--model", "openai/gpt-5-codex",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=str(workspace),
        env={**os.environ},
    )

    response_chunks = []
    try:
        cmd = json.dumps({"type": "prompt", "message": prompt}) + "\n"
        proc.stdin.write(cmd.encode())
        await proc.stdin.drain()

        async for line in proc.stdout:
            text = line.decode().strip()
            if not text:
                continue
            try:
                event = json.loads(text)
            except json.JSONDecodeError:
                continue

            event_type = event.get("type")

            if event_type == "message_update":
                delta_event = event.get("assistantMessageEvent", {})
                if delta_event.get("type") == "text_delta":
                    chunk = delta_event["delta"]
                    response_chunks.append(chunk)
                    yield chunk

            elif event_type == "agent_end":
                break
    finally:
        if proc.returncode is None:
            proc.stdin.close()
            try:
                await asyncio.wait_for(proc.wait(), timeout=5)
            except asyncio.TimeoutError:
                proc.kill()
                await proc.wait()

    full_response = "".join(response_chunks)
    if full_response:
        await context.store(AgentMessage(text=full_response))


def serve():
    server.run(
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
        self_registration_id="stack-claw",
        context_store=PlatformContextStore(),
    )


if __name__ == "__main__":
    serve()
