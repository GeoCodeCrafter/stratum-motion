import { vi } from 'vitest';

interface FakeQuery {
  matches: boolean;
  media: string;
  listeners: Set<(event: MediaQueryListEvent) => void>;
}

/**
 * jsdom has no matchMedia. Install a controllable stand-in that also lets a
 * test flip the preference mid-run, which is the case that actually breaks
 * naive implementations.
 */
export function mockMatchMedia(initial = false) {
  const query: FakeQuery = { matches: initial, media: '', listeners: new Set() };

  const matchMedia = vi.fn((media: string) => {
    query.media = media;
    return {
      get matches() {
        return query.matches;
      },
      media,
      onchange: null,
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        query.listeners.add(listener),
      removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) =>
        query.listeners.delete(listener),
      addListener: (listener: (event: MediaQueryListEvent) => void) => query.listeners.add(listener),
      removeListener: (listener: (event: MediaQueryListEvent) => void) => query.listeners.delete(listener),
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  });

  Object.defineProperty(window, 'matchMedia', { value: matchMedia, writable: true, configurable: true });

  return {
    matchMedia,
    get listenerCount() {
      return query.listeners.size;
    },
    set(matches: boolean) {
      query.matches = matches;
      for (const listener of [...query.listeners]) {
        listener({ matches } as MediaQueryListEvent);
      }
    },
    restore() {
      Object.defineProperty(window, 'matchMedia', { value: undefined, writable: true, configurable: true });
    },
  };
}
