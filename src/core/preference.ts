import type { MotionPreferenceOverride } from '../context/MotionConfigContext';

export interface PreferenceInputs {
  reducedMotion: MotionPreferenceOverride;
  disabled: boolean;
}

/**
 * Combine a `MotionConfig` with the system preference into the single answer
 * every primitive obeys.
 *
 * Extracted from the hook so a layout effect can ask the same question of a
 * freshly read media query. During hydration `useSyncExternalStore` still
 * reports the server snapshot, and priming an element from that stale value
 * puts a transform on the page for a user who asked for none.
 */
export function resolvePreference(config: PreferenceInputs, systemReduced: boolean): boolean {
  if (config.disabled) return true;
  if (config.reducedMotion === 'reduce') return true;
  if (config.reducedMotion === 'no-preference') return false;
  return systemReduced;
}
