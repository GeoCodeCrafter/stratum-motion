import { createElement, useRef, type CSSProperties, type ElementType, type ReactNode } from 'react';
import { useParallax } from '../hooks/useParallax';
import type { ScrollRange } from '../core/scroll';

export interface ParallaxProps {
  children?: ReactNode;
  as?: ElementType;
  /** Fraction of the scroll distance to move. Negative moves against it. */
  speed?: number;
  axis?: 'x' | 'y';
  range?: ScrollRange;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * A parallax layer.
 *
 * The wrapper keeps its own box still and only transforms its contents, so a
 * layer that drifts can never push the elements after it around. Give a
 * background image `scale(1.1)` or some overscan if you can see its edges.
 */
export function Parallax({
  children,
  as = 'div',
  speed = 0.2,
  axis = 'y',
  range = 'cover',
  disabled = false,
  className,
  style,
  ...rest
}: ParallaxProps) {
  const ref = useRef<HTMLElement | null>(null);
  useParallax(ref, { speed, axis, range, disabled });

  return createElement(
    as,
    {
      ...rest,
      ref,
      className,
      style,
      'data-stratum': 'parallax',
      'data-stratum-speed': speed,
    },
    children,
  );
}
