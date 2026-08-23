import { canUseDOM, supportsMatchMedia } from './env';

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Read the user's motion preference.
 *
 * Returns `false` on the server. That is deliberate: the server render is the
 * *final* layout with no animation applied, so "no preference" and "reduce"
 * produce identical markup. The preference only starts to matter once the
 * client has mounted and can read it for real.
 */
export function prefersReducedMotion(): boolean {
  if (!supportsMatchMedia()) return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

type Listener = (reduced: boolean) => void;

/**
 * Subscribe to changes in the motion preference. Users do change this mid
 * session - often precisely because something on the page made them ill.
 */
export function subscribeReducedMotion(listener: Listener): () => void {
  if (!supportsMatchMedia()) return () => {};

  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  const handler = (event: MediaQueryListEvent | MediaQueryList) => listener(event.matches);

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', handler as (event: MediaQueryListEvent) => void);
    return () => query.removeEventListener('change', handler as (event: MediaQueryListEvent) => void);
  }

  // Safari < 14 and jsdom's older shim only expose the deprecated API.
  const legacy = query as MediaQueryList & {
    addListener?: (cb: (event: MediaQueryListEvent) => void) => void;
    removeListener?: (cb: (event: MediaQueryListEvent) => void) => void;
  };
  legacy.addListener?.(handler as (event: MediaQueryListEvent) => void);
  return () => legacy.removeListener?.(handler as (event: MediaQueryListEvent) => void);
}

/** True when the document is hidden, so off-screen tabs can idle their loops. */
export function isDocumentHidden(): boolean {
  return canUseDOM && document.visibilityState === 'hidden';
}
