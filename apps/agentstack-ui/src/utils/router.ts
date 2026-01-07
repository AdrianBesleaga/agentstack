/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AuthError } from 'next-auth';

export const routes = {
  home: () => '/' as const,
  error: ({ error }: { error: AuthError }) => `/error?error=${error.type}`,
  signIn: ({ callbackUrl }: { callbackUrl?: string } = {}) =>
    `/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`,
  notFound: () => '/not-found' as const,
  agentHome: ({ providerId }: AgentPageParams) => `/${encodeURIComponent(providerId)}`,
  agentRun: ({ providerId, contextId }: AgentRunParams) =>
    `${routes.agentHome({ providerId })}${contextId ? `/c/${encodeURIComponent(contextId)}` : ''}`,
  agentSettings: ({ providerId }: AgentPageParams) => `${routes.agentHome({ providerId })}/settings`,
  agentAbout: ({ providerId }: AgentPageParams) => `${routes.agentHome({ providerId })}/about`,
  settings: () => '/settings' as const,
};

interface AgentRunParams {
  providerId: string;
  contextId?: string;
}

interface AgentPageParams {
  providerId: string;
}
