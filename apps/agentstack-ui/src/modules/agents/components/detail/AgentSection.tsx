/**
 * Copyright 2026 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PropsWithChildren } from 'react';

import classes from './AgentSection.module.scss';

interface Props {
  title: string;
}

export function AgentSection({ title, children }: PropsWithChildren<Props>) {
  return (
    <div className={classes.root}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
