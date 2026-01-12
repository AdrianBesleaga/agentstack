/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { OpenPanelLeft, RightPanelClose, RightPanelOpen } from '@carbon/icons-react';

import { useApp } from '#contexts/App/index.ts';

import { NavbarButton } from './NavbarButton';

export function ToggleNavbarButton() {
  const {
    config: { appName },
    sidebarOpen,
    openNavbar,
    closeNavbar,
  } = useApp();

  return (
    <NavbarButton
      icon={OpenPanelLeft}
      hoverIcon={sidebarOpen ? RightPanelOpen : RightPanelClose}
      label={appName}
      onClick={sidebarOpen ? closeNavbar : openNavbar}
    />
  );
}
