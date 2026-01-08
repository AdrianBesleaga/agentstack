/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import { AnimatePresence, motion } from 'framer-motion';

import { Container } from '#components/layouts/Container.tsx';
import { MainContent } from '#components/layouts/MainContent.tsx';
import { ViewHeader } from '#components/ViewHeader/ViewHeader.tsx';
import { ViewStack } from '#components/ViewStack/ViewStack.tsx';
import type { Agent } from '#modules/agents/api/types.ts';
import { useBuildA2AClient } from '#modules/runs/api/queries/useBuildA2AClient.ts';
import { AgentSecretsProvider } from '#modules/runs/contexts/agent-secrets/AgentSecretsProvider.tsx';

import { agentDetailFadeProps } from './AgentDetailView';
import { AgentSecrets } from './AgentSecrets';
import { AgentSection } from './AgentSection';
import classes from './AgentSettingsView.module.scss';

interface Props {
  agent: Agent;
}

export function AgentSettingsView({ agent }: Props) {
  const { agentClient } = useBuildA2AClient({
    providerId: agent.provider.id,
  });

  if (!agentClient) {
    return null;
  }

  return (
    <AgentSecretsProvider agent={agent} agentClient={agentClient}>
      <MainContent>
        <Container size="sm" className={classes.root}>
          <ViewStack>
            <AnimatePresence>
              <motion.div {...agentDetailFadeProps} key="header">
                <ViewHeader heading="Agent settings" />
              </motion.div>

              <motion.div {...agentDetailFadeProps} key="secrets">
                <AgentSection title="Secrets">
                  <AgentSecrets />
                </AgentSection>
              </motion.div>
            </AnimatePresence>
          </ViewStack>
        </Container>
      </MainContent>
    </AgentSecretsProvider>
  );
}
