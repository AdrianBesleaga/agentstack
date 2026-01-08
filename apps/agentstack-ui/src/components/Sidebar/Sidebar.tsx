/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import type { TransitionEvent, TransitionEventHandler } from 'react';
import { useCallback, useRef, useState } from 'react';

import { useApp } from '#contexts/App/index.ts';
import { useParamsFromUrl } from '#hooks/useParamsFromUrl.ts';
import { routes } from '#utils/router.ts';

import { FooterNav } from './FooterNav';
import NewSession from './NewSession.svg';
import { SessionsButton } from './SessionsButton';
import classes from './Sidebar.module.scss';
import { SidebarButton } from './SidebarButton';
import { SidebarMainContent } from './SidebarMainContent';
import { ToggleSidebarButton } from './ToggleSidebarButton';

interface Props {
  className?: string;
}

export function Sidebar({ className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const router = useRouter();
  const { providerId } = useParamsFromUrl();

  const { sidebarOpen } = useApp();

  const checkTransition = useCallback((event: TransitionEvent) => {
    const {
      target,
      currentTarget,
      nativeEvent: { propertyName },
    } = event;

    return target === currentTarget && propertyName === 'width';
  }, []);

  const handleTransitionStart: TransitionEventHandler = useCallback(
    (event) => {
      if (checkTransition(event)) {
        setIsAnimating(true);
      }
    },
    [checkTransition],
  );

  const handleTransitionEnd: TransitionEventHandler = useCallback(
    (event) => {
      if (checkTransition(event)) {
        setIsAnimating(false);
      }
    },
    [checkTransition],
  );

  return (
    <div
      ref={ref}
      className={clsx(classes.root, className, {
        [classes.isOpen]: sidebarOpen,
        [classes.isAnimating]: isAnimating,
      })}
      onTransitionStart={handleTransitionStart}
      onTransitionEnd={handleTransitionEnd}
    >
      <div className={classes.content}>
        <header className={classes.stack}>
          <ToggleSidebarButton />

          <SidebarButton
            icon={NewSession}
            label="New Session"
            onClick={() => {
              router.push(routes.agentRun({ providerId: String(providerId) }));
            }}
          />
        </header>

        <div className={classes.body}>
          {sidebarOpen ? <SidebarMainContent className={classes.mainContent} /> : <SessionsButton />}
        </div>

        <footer className={classes.stack}>
          <FooterNav />
        </footer>
      </div>
    </div>
  );
}
