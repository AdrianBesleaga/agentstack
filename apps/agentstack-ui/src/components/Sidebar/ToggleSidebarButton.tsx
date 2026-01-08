/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenPanelLeft, RightPanelClose, RightPanelOpen } from '@carbon/icons-react';

import { useApp } from '#contexts/App/index.ts';

import { SidebarButton } from './SidebarButton';

export function ToggleSidebarButton() {
  const {
    config: { appName },
    sidebarOpen,
    openSidebar,
    closeSidebar,
  } = useApp();

  return (
    <SidebarButton
      icon={OpenPanelLeft}
      hoverIcon={sidebarOpen ? RightPanelOpen : RightPanelClose}
      label={appName}
      onClick={sidebarOpen ? closeSidebar : openSidebar}
    />
  );
}
