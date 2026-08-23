/** Built-in easing names. Anything else is treated as a raw CSS timing function. */
export type EasingName =
  | 'linear'
  | 'ease'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'emphasised'
  | 'softSpring'
  | 'anticipate';

export type Easing = EasingName | (string & {});

const CSS_EASINGS: Record<EasingName, string> = {
  linear: 'linear',
  ease: 'ease',
  easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
  easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
  easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  // Long tail, quick start - reads as "settled" rather than "stopped".
  emphasised: 'cubic-bezier(0.22, 1, 0.36, 1)',
  // Spring-like without a physics loop, so it stays composited on the GPU.
  softSpring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  anticipate: 'cubic-bezier(0.68, -0.55, 0.27, 1.55)',
};

function isEasingName(value: string): value is EasingName {
  return Object.prototype.hasOwnProperty.call(CSS_EASINGS, value);
}

/**
 * Turn an easing name into a CSS timing function. Unknown strings pass
 * through untouched so callers can supply their own `cubic-bezier(...)`.
 */
export function resolveEasing(easing: Easing = 'emphasised'): string {
  return isEasingName(easing) ? CSS_EASINGS[easing] : easing;
}

/** The names this library ships with, for docs and tests. */
export const easingNames: readonly EasingName[] = Object.keys(CSS_EASINGS) as EasingName[];
