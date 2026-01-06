/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import { Link, Share } from '@carbon/icons-react';
import { Button } from '@carbon/react';
import { useCallback } from 'react';

import { AppName } from '#components/AppName/AppName.tsx';
import { AppHeader } from '#components/layouts/AppHeader.tsx';
import { useToast } from '#contexts/Toast/index.ts';
import { routes } from '#utils/router.ts';

import classes from './CommonHeader.module.scss';

export function CommonHeader() {
  const { addToast } = useToast();

  const handleCopy = useCallback(() => {
    const url = `${window.location.origin}${routes.home()}`;
    navigator.clipboard.writeText(url);
    addToast({ title: 'Link copied to clipboard', icon: Link, timeout: 10_000 });
  }, [addToast]);

  return (
    <AppHeader>
      <div className={classes.root}>
        <AppName withLink />

        <div className={classes.right}>
          <Button renderIcon={Share} size="sm" onClick={() => handleCopy()} kind="tertiary">
            Share catalog
          </Button>
        </div>
      </div>
    </AppHeader>
  );
}
