/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenPanelLeft, RightPanelClose, RightPanelOpen } from '@carbon/icons-react';
import { Button } from '@carbon/react';

import { useApp } from '#contexts/App/index.ts';

import classes from './ToggleSidebarButton.module.scss';

export function ToggleSidebarButton() {
  const {
    config: { appName },
    sidebarOpen,
    openSidebar,
    closeSidebar,
  } = useApp();

  return (
    <Button className={classes.root} kind="ghost" size="sm" onClick={sidebarOpen ? closeSidebar : openSidebar}>
      <div className={classes.icon}>
        <OpenPanelLeft />

        {sidebarOpen ? <RightPanelOpen /> : <RightPanelClose />}
      </div>

      <span className={classes.label}>{appName}</span>
    </Button>
  );
}
