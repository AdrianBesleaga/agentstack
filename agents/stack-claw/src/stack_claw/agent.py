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

from a2a.types import Message
from agentstack_sdk.a2a.extensions import AgentDetail
from agentstack_sdk.server import Server

server = Server()


@server.agent(
    name="Stack Claw",
    description="Pi-powered coding agent",
    version="1.0.0",
    detail=AgentDetail(interaction_mode="multi-turn"),
)
async def stack_claw(input: Message):
    first_part = input.parts[0] if input.parts else None
    if not first_part or not hasattr(first_part.root, "text"):
        yield "Send me a text message."
        return

    user_text = first_part.root.text

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

    try:
        cmd = json.dumps({"type": "prompt", "message": user_text}) + "\n"
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
                    yield delta_event["delta"]

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


def serve():
    server.run(
        host=os.getenv("HOST", "127.0.0.1"),
        port=int(os.getenv("PORT", "8000")),
        self_registration_id="stack-claw",
    )


if __name__ == "__main__":
    serve()
