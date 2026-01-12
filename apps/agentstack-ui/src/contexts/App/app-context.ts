/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { createContext } from 'react';

import type { RuntimeConfig, SidePanelVariant } from './types';

export const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppContextValue {
  config: RuntimeConfig;
  sidebarOpen: boolean;
  activeSidePanel: SidePanelVariant | null;
  openNavbar: () => void;
  closeNavbar: () => void;
  openSidePanel: (variant: SidePanelVariant) => void;
  closeSidePanel: () => void;
}
