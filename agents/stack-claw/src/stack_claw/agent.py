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
from agentstack_sdk.a2a.extensions import AgentDetail
from agentstack_sdk.a2a.types import AgentMessage
from agentstack_sdk.server import Server
from agentstack_sdk.server.context import RunContext

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

    await context.store(input)

    history = [msg async for msg in context.load_history() if isinstance(msg, Message) and msg.parts]
    prior = history[:-1][-20:]

    prompt = user_text
    if prior:
        lines = []
        for msg in prior:
            role = "User" if msg.role == Role.user else "Assistant"
            text = "".join(p.root.text for p in msg.parts if hasattr(p.root, "text"))
            if text:
                lines.append(f"{role}: {text}")
        if lines:
            prompt = "<conversation_history>\n" + "\n".join(lines) + "\n</conversation_history>\n\n" + user_text

    pi_bin = shutil.which("pi")
    if not pi_bin:
        yield "Error: `pi` CLI not found. Install via `npm install -g @mariozechner/pi-coding-agent`."
        return

    proc = await asyncio.create_subprocess_exec(
        pi_bin,
        "--mode", "rpc",
        "--no-session",
        "--provider", "openai",
        "--model", "openai/gpt-4o",
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
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
    )


if __name__ == "__main__":
    serve()
