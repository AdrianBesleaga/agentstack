/**
 * Copyright 2026 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import z from 'zod';

import type { A2AUiExtension } from '../types';

const URI = 'https://a2a-extensions.agentstack.beeai.dev/tools/call/v1';

export const toolCallServerSchema = z.object({
  name: z.string(),
  title: z.string().nullable(),
  version: z.string().describe('The version of the server.'),
});

export type ToolCallServer = z.infer<typeof toolCallServerSchema>;

export const toolCallRequestSchema = z.object({
  name: z.string(),
  title: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  input: z.record(z.string(), z.unknown()).nullable(),
  server: toolCallServerSchema.nullable().optional(),
});

export type ToolCallRequest = z.infer<typeof toolCallRequestSchema>;

export const toolCallResponseSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

export type ToolCallResponse = z.infer<typeof toolCallResponseSchema>;

export const ToolCallRequestExtension: A2AUiExtension<typeof URI, ToolCallRequest> = {
  getMessageMetadataSchema: () => z.object({ [URI]: toolCallRequestSchema }).partial(),
  getUri: () => URI,
};

export const ToolCallResponseExtension: A2AUiExtension<typeof URI, ToolCallResponse> = {
  getMessageMetadataSchema: () => z.object({ [URI]: toolCallResponseSchema }).partial(),
  getUri: () => URI,
};
