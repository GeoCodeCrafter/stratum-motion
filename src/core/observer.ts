import { supportsIntersectionObserver } from './env';

export interface ObserveOptions {
  /** Fraction of the element that must be visible, 0..1. */
  amount?: number;
  /** CSS margin box grown or shrunk around the root. */
  rootMargin?: string;
  root?: Element | Document | null;
}

export type IntersectionCallback = (entry: IntersectionObserverEntry) => void;

interface Pooled {
  observer: IntersectionObserver;
  callbacks: WeakMap<Element, IntersectionCallback>;
  count: number;
}

const pool = new Map<string, Pooled>();

function keyFor(options: Required<Pick<ObserveOptions, 'amount' | 'rootMargin'>>, root: unknown): string {
  const rootId = root === null || root === undefined ? 'viewport' : 'custom';
  return `${rootId}|${options.amount}|${options.rootMargin}`;
}

/**
 * Observe an element with a pooled IntersectionObserver.
 *
 * Every `Reveal` on a page tends to want the same threshold, and browsers
 * charge per observer, so identical configurations share one instance.
 */
export function observeIntersection(
  element: Element,
  options: ObserveOptions,
  callback: IntersectionCallback,
): () => void {
  if (!supportsIntersectionObserver()) return () => {};

  const amount = options.amount ?? 0.2;
  const rootMargin = options.rootMargin ?? '0px';
  const root = options.root ?? null;
  const key = keyFor({ amount, rootMargin }, root);

  let entry = pool.get(key);
  if (!entry) {
    const callbacks = new WeakMap<Element, IntersectionCallback>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const item of entries) callbacks.get(item.target)?.(item);
      },
      { threshold: amount, rootMargin, root: root as Element | Document | null },
    );
    entry = { observer, callbacks, count: 0 };
    pool.set(key, entry);
  }

  entry.callbacks.set(element, callback);
  entry.observer.observe(element);
  entry.count += 1;

  const pooled = entry;
  return () => {
    pooled.callbacks.delete(element);
    pooled.observer.unobserve(element);
    pooled.count -= 1;
    if (pooled.count <= 0) {
      pooled.observer.disconnect();
      pool.delete(key);
    }
  };
}

/** Live observer count. Tests assert this stays at one for shared settings. */
export function observerPoolSize(): number {
  return pool.size;
}

/** Tear the pool down between tests. */
export function resetObserverPool(): void {
  for (const entry of pool.values()) entry.observer.disconnect();
  pool.clear();
}
