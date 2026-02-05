/**
 * Copyright 2025 © BeeAI a Series of LF Projects, LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ActionProvider,
  ComponentRegistry,
  Components,
  DataProvider,
  Renderer,
  SetData,
  useAction,
  useActions,
  VisibilityProvider,
} from '@json-render/react';
import { defineCatalog, Spec } from '@json-render/core';
import { schema } from '@json-render/react';
import { Button, InlineLoading } from '@carbon/react';
import { z } from 'zod';
import { ReactNode, useMemo, useRef } from 'react';

export const catalog = defineCatalog(schema, {
  components: {
    Button: {
      props: z.object({
        label: z.string(),
        action: z.string(),
        kind: z.enum(['primary', 'secondary', 'tertiary', 'ghost', 'danger']).optional(),
        size: z.enum(['sm', 'md', 'lg']).optional(),
      }),
      description: 'Clickable button (Carbon Button)',
    },
    VerticalContainer: {
      props: z.object({
        gap: z.number().optional(),
      }),
      hasChildren: true,
      description: 'Container that stacks children vertically',
    },
    Paragraph: {
      props: z.object({
        text: z.string(),
      }),
      description: 'Text paragraph',
    },
    HorizontalContainer: {
      props: z.object({
        gap: z.number().optional(),
      }),
      hasChildren: true,
      description: 'Container that stacks children horizontally',
    },
  },
  actions: {
    button_click: { params: z.object({ button_id: z.string() }), description: 'Submits the button' },
  },
});

const Btn = ({ props, loading, ...rest }) => {
  const action = useActions();

  return (
    <Button
      kind={props.kind ?? 'primary'}
      size={props.size ?? 'md'}
      disabled={loading}
      onClick={() => {
        action.handlers.button_click(props.elementKey);
      }}
    >
      {loading ? <InlineLoading /> : props.label}
    </Button>
  );
};

export const components: Components<typeof catalog> = {
  Button: Btn,
  VerticalContainer: ({ props, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: props.gap ?? 8 }}>{children}</div>
  ),
  Paragraph: ({ props }) => <p>{props.text}</p>,
  HorizontalContainer: ({ props, children }) => (
    <div style={{ display: 'flex', flexDirection: 'row', gap: props.gap ?? 8 }}>{children}</div>
  ),
};

interface RendererProps {
  spec: Spec | null;
  data?: Record<string, unknown>;
  setData?: SetData;
  onDataChange?: (path: string, value: unknown) => void;
  loading?: boolean;
}

// Build registry - uses refs to avoid recreating on data changes
function buildRegistry(
  dataRef: React.RefObject<Record<string, unknown>>,
  setDataRef: React.RefObject<SetData | undefined>,
  loading?: boolean,
): ComponentRegistry {
  const registry: ComponentRegistry = {};

  for (const [name, componentFn] of Object.entries(components)) {
    registry[name] = (renderProps: { element: { props: Record<string, unknown> }; children?: ReactNode }) => {
      return componentFn({
        props: { ...renderProps.element.props, elementKey: renderProps.element.key } as never,
        children: renderProps.children,
        loading,
      });
    };
  }

  return registry;
}

const fallbackRegistry = (renderProps: { element: { type: string } }) => (
  <div>Fallback: {renderProps.element.type}</div>
);

export function GenerativeInterfaceRenderer({ spec, data = {}, setData, onDataChange, loading }: RendererProps) {
  // Use refs to keep registry stable while still accessing latest data/setData
  const dataRef = useRef(data);
  const setDataRef = useRef(setData);
  dataRef.current = data;
  setDataRef.current = setData;

  // Memoize registry - only changes when loading changes
  const registry = useMemo(() => buildRegistry(dataRef, setDataRef, loading), [loading]);

  if (!spec) return null;

  return (
    <DataProvider initialData={data} onDataChange={onDataChange}>
      <VisibilityProvider>
        <ActionProvider
          handlers={{
            button_click: (elementKey) => {
              console.log(elementKey);
            },
          }}
        >
          <Renderer spec={spec} registry={registry} fallback={fallbackRegistry} loading={loading} />
        </ActionProvider>
      </VisibilityProvider>
    </DataProvider>
  );
}
