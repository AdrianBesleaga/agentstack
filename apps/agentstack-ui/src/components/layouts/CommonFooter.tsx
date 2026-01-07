/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import { Settings } from '@carbon/icons-react';
import { Button } from '@carbon/react';

import { UserNav } from '#components/Sidebar/UserNav.tsx';
import { useApp } from '#contexts/App/index.ts';
import { routes } from '#utils/router.ts';

import classes from './CommonFooter.module.scss';

export function CommonFooter() {
  const {
    config: { isAuthEnabled },
  } = useApp();

  return (
    <div className={classes.root}>
      {isAuthEnabled ? (
        <UserNav />
      ) : (
        <Button
          href={routes.settings()}
          kind="ghost"
          size="sm"
          renderIcon={Settings}
          className={classes.settingsButton}
        >
          Settings
        </Button>
      )}
    </div>
  );
}
