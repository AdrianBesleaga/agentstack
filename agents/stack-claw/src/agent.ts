/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server } from "agentstack-sdk/experimental/server";
import {
  createAgentSession,
  AuthStorage,
  SessionManager,
} from "@mariozechner/pi-coding-agent";
import { getModel } from "@mariozechner/pi-ai";

setInterval(() => {}, 1 << 30);

const server = new Server();

server.agent({
  name: "Stack Claw",
  description: "Pi-powered coding agent",
  version: "1.0.0",
  detail: {
    interaction_mode: "multi-turn",
  },
  handler: async function* (input) {
    const firstPart = input.parts.at(0);
    if (!firstPart || !("text" in firstPart)) {
      yield "Send me a text message.";
      return;
    }

    const authStorage = AuthStorage.inMemory();
    authStorage.setRuntimeApiKey("openai", process.env.OPENAI_API_KEY!);

    const model = getModel("openai", "gpt-4o");

    const { session } = await createAgentSession({
      model,
      authStorage,
      sessionManager: SessionManager.inMemory(),
      tools: [],
    });

    await session.prompt(firstPart.text);

    const messages = session.state.messages;
    const lastMessage = messages[messages.length - 1];

    if (lastMessage?.role === "assistant") {
      for (const content of lastMessage.content) {
        if (content.type === "text") {
          yield content.text;
        }
      }
    } else {
      yield "No response from the model.";
    }
  },
});

server
  .run({
    host: process.env.HOST ?? "127.0.0.1",
    port: Number(process.env.PORT ?? 8000),
    selfRegistrationId: "stack-claw",
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
