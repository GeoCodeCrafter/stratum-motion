import { useEffect, useLayoutEffect } from 'react';

/**
 * True when running without a DOM (Node, React Server Components, static
 * export). Every primitive in this library has to survive being rendered in
 * that environment, so this is the guard the rest of the code leans on.
 */
export const isServer: boolean =
  typeof window === 'undefined' || typeof document === 'undefined';

/** Inverse of {@link isServer}, kept for readability at call sites. */
export const canUseDOM: boolean = !isServer;

/**
 * `useLayoutEffect` warns when it runs during server rendering, but swapping
 * to `useEffect` on the client would let a frame paint with the pre-animation
 * styles applied. Pick per environment instead.
 */
export const useIsomorphicLayoutEffect: typeof useEffect = isServer
  ? useEffect
  : useLayoutEffect;

/** Feature detection for the Web Animations API. jsdom, for one, lacks it. */
export function supportsWebAnimations(): boolean {
  return canUseDOM && typeof Element !== 'undefined' && typeof Element.prototype.animate === 'function';
}

/** Feature detection for IntersectionObserver. */
export function supportsIntersectionObserver(): boolean {
  return canUseDOM && typeof IntersectionObserver === 'function';
}

/** Feature detection for matchMedia, which older test environments omit. */
export function supportsMatchMedia(): boolean {
  return canUseDOM && typeof window.matchMedia === 'function';
}
