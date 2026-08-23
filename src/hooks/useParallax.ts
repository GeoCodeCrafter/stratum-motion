import { useEffect, type RefObject } from 'react';
import { onFrame } from '../core/scheduler';
import { scrollProgress, viewportHeight, isRectVisible, type ScrollRange } from '../core/scroll';
import { parallaxOffset, parallaxTravel } from '../core/parallax';
import { buildTransform } from '../core/transform';
import { canUseDOM } from '../core/env';
import { useReducedMotion } from './useReducedMotion';

export interface UseParallaxOptions {
  /** Fraction of the scroll distance the layer moves. Negative inverts it. */
  speed?: number;
  axis?: 'x' | 'y';
  range?: ScrollRange;
  /** Opt out without breaking the rules of hooks. */
  disabled?: boolean;
}

/**
 * Translate an element as it scrolls.
 *
 * The transform is written straight to the node rather than through state:
 * a parallax layer updating React sixty times a second would re-render its
 * whole subtree for a value only the compositor needs.
 */
export function useParallax<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: UseParallaxOptions = {},
): void {
  const { speed = 0.2, axis = 'y', range = 'cover', disabled = false } = options;
  const reduced = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || !canUseDOM) return;

    // Reduced motion means no parallax at all - it is the single most
    // reliable way to make a page unusable for a vestibular disorder.
    if (disabled || reduced) {
      element.style.transform = '';
      element.style.willChange = '';
      return;
    }

    element.style.willChange = 'transform';

    const update = () => {
      const rect = element.getBoundingClientRect();
      const viewport = viewportHeight();
      if (!isRectVisible(rect, viewport, 100)) return;

      const progress = scrollProgress(rect, viewport, range);
      const offset = parallaxOffset(progress, speed, parallaxTravel(rect.height, viewport));
      element.style.transform = buildTransform(axis === 'y' ? { y: offset } : { x: offset });
    };

    update();
    const stop = onFrame(update);

    return () => {
      stop();
      element.style.willChange = '';
    };
  }, [ref, speed, axis, range, disabled, reduced]);
}
