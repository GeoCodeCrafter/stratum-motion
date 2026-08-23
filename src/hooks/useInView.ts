import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { observeIntersection, type ObserveOptions } from '../core/observer';
import { supportsIntersectionObserver } from '../core/env';

export interface UseInViewOptions extends ObserveOptions {
  /** Stop observing after the first entry. Defaults to true. */
  once?: boolean;
  /** Force the "visible" result, e.g. when motion is disabled. */
  skip?: boolean;
}

/**
 * Track whether an element is in the viewport.
 *
 * When IntersectionObserver is unavailable the hook reports `true` on mount.
 * Failing open matters: a browser without the API must still show content,
 * not sit on an invisible page for ever.
 */
export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  options: UseInViewOptions = {},
): boolean {
  const { once = true, skip = false, amount = 0.2, rootMargin = '0px', root = null } = options;
  const [inView, setInView] = useState(false);
  const settled = useRef(false);

  const handle = useCallback(
    (entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (once) settled.current = true;
      } else if (!once) {
        setInView(false);
      }
    },
    [once],
  );

  useEffect(() => {
    if (skip) {
      setInView(true);
      return;
    }
    if (settled.current) return;

    const element = ref.current;
    if (!element) return;

    if (!supportsIntersectionObserver()) {
      setInView(true);
      return;
    }

    return observeIntersection(element, { amount, rootMargin, root }, handle);
  }, [ref, skip, amount, rootMargin, root, handle]);

  return inView;
}
