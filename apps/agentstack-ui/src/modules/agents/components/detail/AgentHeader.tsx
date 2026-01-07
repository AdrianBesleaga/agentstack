/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import { AppHeader } from '#components/layouts/AppHeader.tsx';
import { useParamsFromUrl } from '#hooks/useParamsFromUrl.ts';
import { useAgent } from '#modules/agents/api/queries/useAgent.ts';

import classes from './AgentHeader.module.scss';
import { AgentNav } from './AgentNav';
import { AgentShareButton } from './AgentShareButton';

export function AgentHeader() {
  const { providerId } = useParamsFromUrl();
  const { data: agent } = useAgent({ providerId });

  return (
    <AppHeader>
      <div className={classes.root}>
        {agent && (
          <>
            <h1 className={classes.agentName}>{agent.name}</h1>

            <div className={classes.buttons}>
              <AgentShareButton agent={agent} />
              <AgentNav />
            </div>
          </>
        )}
      </div>
    </AppHeader>
  );
}
