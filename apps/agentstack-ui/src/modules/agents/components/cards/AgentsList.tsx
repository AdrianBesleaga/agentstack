/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import { SkeletonItems } from '#components/SkeletonItems/SkeletonItems.tsx';
import { useListAgents } from '#modules/agents/api/queries/useListAgents.ts';
import { ListAgentsOrderBy } from '#modules/agents/api/types.ts';
import type { ListProvidersResponse } from '#modules/providers/api/types.ts';

import classes from './AgentsList.module.scss';
import { AgentsListItem } from './AgentsListItem';

interface Props {
  initialData?: ListProvidersResponse;
}
export function AgentsList({ initialData }: Props) {
  const { data: agents, isLoading } = useListAgents({
    orderBy: ListAgentsOrderBy.Name,
    initialData,
  });

  const noItems = agents?.length === 0 && !isLoading;

  if (noItems) {
    return null;
  }

  return (
    <section className={classes.root}>
      {isLoading ? (
        <SkeletonItems count={6} render={(idx) => <AgentsListItem.Skeleton key={idx} />} />
      ) : (
        agents?.map((agent) => <AgentsListItem agent={agent} key={agent.provider.id} />)
      )}
    </section>
  );
}
