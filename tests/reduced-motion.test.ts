import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  prefersReducedMotion,
  subscribeReducedMotion,
  REDUCED_MOTION_QUERY,
} from '../src/core/reduced-motion';
import { mockMatchMedia } from './helpers/matchMedia';

let media: ReturnType<typeof mockMatchMedia> | null = null;

afterEach(() => {
  media?.restore();
  media = null;
});

describe('prefersReducedMotion', () => {
  it('reads the media query', () => {
    media = mockMatchMedia(true);
    expect(prefersReducedMotion()).toBe(true);
    expect(media.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
  });

  it('reports no preference when the query does not match', () => {
    media = mockMatchMedia(false);
    expect(prefersReducedMotion()).toBe(false);
  });

  it('returns false rather than throwing where matchMedia is missing', () => {
    Object.defineProperty(window, 'matchMedia', { value: undefined, writable: true, configurable: true });
    expect(prefersReducedMotion()).toBe(false);
  });
});

describe('subscribeReducedMotion', () => {
  it('fires when the preference changes mid-session', () => {
    media = mockMatchMedia(false);
    const listener = vi.fn();
    subscribeReducedMotion(listener);

    media.set(true);

    expect(listener).toHaveBeenCalledWith(true);
  });

  it('detaches on unsubscribe', () => {
    media = mockMatchMedia(false);
    const listener = vi.fn();
    const unsubscribe = subscribeReducedMotion(listener);

    unsubscribe();
    media.set(true);

    expect(listener).not.toHaveBeenCalled();
    expect(media.listenerCount).toBe(0);
  });

  it('returns a safe no-op where matchMedia is missing', () => {
    Object.defineProperty(window, 'matchMedia', { value: undefined, writable: true, configurable: true });
    const unsubscribe = subscribeReducedMotion(vi.fn());
    expect(() => unsubscribe()).not.toThrow();
  });
});
