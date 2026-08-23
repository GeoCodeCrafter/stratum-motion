import { useSyncExternalStore } from 'react';
import { prefersReducedMotion, subscribeReducedMotion } from '../core/reduced-motion';
import { useMotionConfig } from '../context/MotionConfigContext';

function subscribe(onChange: () => void): () => void {
  return subscribeReducedMotion(() => onChange());
}

function getSnapshot(): boolean {
  return prefersReducedMotion();
}

/** Server snapshot is always `false`; see the note in core/reduced-motion. */
function getServerSnapshot(): boolean {
  return false;
}

/** The raw OS-level preference, ignoring any `MotionConfig` override. */
export function useSystemReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * The preference every primitive should actually obey: the OS setting unless
 * a `MotionConfig` above it says otherwise.
 */
export function useReducedMotion(): boolean {
  const system = useSystemReducedMotion();
  const { reducedMotion, disabled } = useMotionConfig();

  if (disabled) return true;
  if (reducedMotion === 'reduce') return true;
  if (reducedMotion === 'no-preference') return false;
  return system;
}
