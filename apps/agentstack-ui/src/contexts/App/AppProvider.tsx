/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */
'use client';
import type { PropsWithChildren } from 'react';
import { useCallback, useMemo, useState } from 'react';

import { AppContext } from './app-context';
import type { RuntimeConfig, SidePanelVariant } from './types';

interface Props {
  config: RuntimeConfig;
}

export function AppProvider({ config, children }: PropsWithChildren<Props>) {
  const [sidebarOpen, setNavbarOpen] = useState(true);
  const [activeSidePanel, setActiveSidePanel] = useState<SidePanelVariant | null>(null);

  const openNavbar = useCallback(() => {
    setNavbarOpen(true);
  }, []);

  const closeNavbar = useCallback(() => {
    setNavbarOpen(false);
  }, []);

  const openSidePanel = useCallback((variant: SidePanelVariant) => {
    setActiveSidePanel(variant);
  }, []);

  const closeSidePanel = useCallback(() => {
    setActiveSidePanel(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      config,
      sidebarOpen,
      activeSidePanel,
      openNavbar,
      closeNavbar,
      openSidePanel,
      closeSidePanel,
    }),
    [config, sidebarOpen, activeSidePanel, openNavbar, closeNavbar, openSidePanel, closeSidePanel],
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}
