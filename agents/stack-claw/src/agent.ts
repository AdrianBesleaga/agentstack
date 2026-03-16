/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { Server } from "agentstack-sdk/experimental/server";

setInterval(() => {}, 1 << 30);

const server = new Server();

server.agent({
  name: "Stack Claw",
  description: "A simple agent built with the TypeScript SDK",
  version: "1.0.0",
  detail: {
    interaction_mode: "multi-turn",
  },
  handler: async function* (input) {
    const firstPart = input.parts.at(0);

    if (firstPart && "text" in firstPart) {
      yield `Hello! You said: ${firstPart.text}`;
    } else {
      yield "Hello! Send me a text message.";
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
