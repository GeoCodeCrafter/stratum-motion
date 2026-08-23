import { useEffect, useRef, useState, type RefObject } from 'react';
import { onFrame } from '../core/scheduler';
import { scrollProgress, viewportHeight, type ScrollRange } from '../core/scroll';
import { canUseDOM } from '../core/env';
import { round } from '../core/math';

export interface UseScrollProgressOptions {
  range?: ScrollRange;
  /**
   * Rounding applied before deciding to re-render. Three decimals is roughly
   * one step per pixel on a tall page and keeps React out of the hot path.
   */
  precision?: number;
  /** Skip measuring entirely, e.g. under reduced motion. */
  skip?: boolean;
}

/**
 * Track an element's scroll progress as a number between 0 and 1.
 *
 * Measurement happens inside the shared rAF loop rather than in the scroll
 * event itself, so a fast scroll produces one layout read per frame instead
 * of one per event.
 */
export function useScrollProgress<T extends Element>(
  ref: RefObject<T | null>,
  options: UseScrollProgressOptions = {},
): number {
  const { range = 'cover', precision = 3, skip = false } = options;
  const [value, setValue] = useState(0);
  const last = useRef(-1);

  useEffect(() => {
    if (skip || !canUseDOM) return;
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const rect = element.getBoundingClientRect();
      const next = round(scrollProgress(rect, viewportHeight(), range), precision);
      if (next !== last.current) {
        last.current = next;
        setValue(next);
      }
    };

    measure();
    return onFrame(measure);
  }, [ref, range, precision, skip]);

  return value;
}
