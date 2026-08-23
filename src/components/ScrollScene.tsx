import { createElement, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useScrollProgress } from '../hooks/useScrollProgress';
import { useReducedMotion } from '../hooks/useReducedMotion';
import type { ScrollRange } from '../core/scroll';

export interface ScrollSceneRenderProps {
  /** 0..1 across the configured range. */
  progress: number;
  /** True when the user asked for reduced motion. */
  reduced: boolean;
}

export interface ScrollSceneProps {
  children: (props: ScrollSceneRenderProps) => ReactNode;
  as?: ElementType;
  range?: ScrollRange;
  /** Decimal places kept before re-rendering. Lower means fewer renders. */
  precision?: number;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Hand scroll progress to arbitrary children.
 *
 * This is the escape hatch for anything the presets do not cover - driving a
 * Three.js camera, a canvas, an SVG path. Under reduced motion the progress
 * pins to 1 so scroll-driven scenes render their finished state rather than
 * their first frame.
 */
export function ScrollScene({
  children,
  as = 'div',
  range = 'cover',
  precision = 2,
  className,
  style,
  ...rest
}: ScrollSceneProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = useReducedMotion();
  const progress = useScrollProgress(ref, { range, precision, skip: reduced });

  return createElement(
    as,
    {
      ...rest,
      ref,
      className,
      style,
      'data-stratum': 'scroll-scene',
      'data-stratum-progress': reduced ? 1 : progress,
    },
    children({ progress: reduced ? 1 : progress, reduced }),
  );
}
