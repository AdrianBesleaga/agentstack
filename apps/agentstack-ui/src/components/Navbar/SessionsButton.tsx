/**
 * Copyright 2026 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecentlyViewed } from '@carbon/icons-react';
import { IconButton } from '@carbon/react';
import { AnimatePresence, motion } from 'framer-motion';

import { useApp } from '#contexts/App/index.ts';
import { fadeProps } from '#utils/fadeProps.ts';

export function SessionsButton() {
  const { openNavbar } = useApp();

  return (
    <AnimatePresence>
      <motion.div {...fadeProps()}>
        <IconButton label="Sessions" size="sm" kind="ghost" autoAlign align="right" onClick={() => openNavbar()}>
          <RecentlyViewed />
        </IconButton>
      </motion.div>
    </AnimatePresence>
  );
}
