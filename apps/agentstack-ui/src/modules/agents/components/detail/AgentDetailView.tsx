/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import { SkeletonText } from '@carbon/react';

import { Container } from '#components/layouts/Container.tsx';
import { MainContent } from '#components/layouts/MainContent.tsx';
import { MarkdownContent } from '#components/MarkdownContent/MarkdownContent.tsx';
import { ViewHeader } from '#components/ViewHeader/ViewHeader.tsx';
import { ViewStack } from '#components/ViewStack/ViewStack.tsx';
import { useParamsFromUrl } from '#hooks/useParamsFromUrl.ts';
import { useAgent } from '#modules/agents/api/queries/useAgent.ts';

import { AgentCredits } from './AgentCredits';
import classes from './AgentDetailView.module.scss';
import { AgentTags } from './AgentTags';
import { AgentToolsList } from './AgentToolsList';

export function AgentDetailView() {
  const { providerId } = useParamsFromUrl();
  const { data: agent, isPending } = useAgent({ providerId: providerId ?? '' });

  if (!agent) {
    return null;
  }

  const {
    description,
    ui: { contributors, author },
  } = agent;

  return (
    <MainContent>
      <Container size="sm" className={classes.root}>
        <ViewStack>
          <ViewHeader heading="Agent details" />

          <div className={classes.info}>
            {!isPending ? (
              <>
                <div className={classes.mainInfo}>
                  {description && <MarkdownContent className={classes.mainContent}>{description}</MarkdownContent>}

                  {(author || contributors) && <AgentCredits author={author} contributors={contributors} />}
                </div>

                <AgentTags agent={agent} />
              </>
            ) : (
              <SkeletonText paragraph lineCount={5} />
            )}
          </div>

          <div>
            <h2>Tools</h2>
            <AgentToolsList agent={agent} />
          </div>
        </ViewStack>
      </Container>
    </MainContent>
  );
}
