import { Children, createElement, useMemo, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { staggerDelays, type StaggerFrom } from '../core/stagger';
import { StaggerDelayProvider } from '../context/StaggerContext';
import { useStaggerDelay } from '../context/StaggerContext';

export interface StaggerProps {
  children?: ReactNode;
  as?: ElementType;
  /** Milliseconds between neighbouring children. */
  step?: number;
  from?: StaggerFrom;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Offset each child's reveal by a step.
 *
 * Delays come from the child's position in the list, not from a mutable
 * counter incremented during render - React may render a subtree twice in
 * StrictMode, and a counter would hand out different delays each pass.
 * Nested `Stagger`s compose: the inner delays add to the outer one.
 */
export function Stagger({
  children,
  as = 'div',
  step = 80,
  from = 'first',
  className,
  style,
  ...rest
}: StaggerProps) {
  const inherited = useStaggerDelay();
  const items = Children.toArray(children);
  const delays = useMemo(() => staggerDelays(items.length, step, from), [items.length, step, from]);

  return createElement(
    as,
    { ...rest, className, style, 'data-stratum': 'stagger' },
    items.map((child, index) => (
      <StaggerDelayProvider key={index} delay={inherited + (delays[index] ?? 0)}>
        {child}
      </StaggerDelayProvider>
    )),
  );
}
