import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Easing } from '../core/easing';

export type MotionPreferenceOverride = 'auto' | 'reduce' | 'no-preference';

export interface MotionConfigValue {
  /**
   * `auto` follows the OS setting. The explicit values exist for app-level
   * toggles, which some users prefer over changing a system preference.
   */
  reducedMotion: MotionPreferenceOverride;
  /** Multiplier applied to every duration. Handy for demos and debugging. */
  durationScale: number;
  defaultDuration: number;
  defaultEasing: Easing;
  /** Disable all animation, e.g. while a test suite runs. */
  disabled: boolean;
}

export const defaultMotionConfig: MotionConfigValue = {
  reducedMotion: 'auto',
  durationScale: 1,
  defaultDuration: 600,
  defaultEasing: 'emphasised',
  disabled: false,
};

const MotionConfigContext = createContext<MotionConfigValue>(defaultMotionConfig);

export interface MotionConfigProps extends Partial<MotionConfigValue> {
  children?: ReactNode;
}

/**
 * Provide defaults to every primitive below it. Nested providers inherit from
 * their parent rather than resetting, so a section can slow itself down
 * without restating the whole configuration.
 */
export function MotionConfig({ children, ...overrides }: MotionConfigProps) {
  const parent = useContext(MotionConfigContext);

  const value = useMemo<MotionConfigValue>(
    () => ({
      reducedMotion: overrides.reducedMotion ?? parent.reducedMotion,
      durationScale: overrides.durationScale ?? parent.durationScale,
      defaultDuration: overrides.defaultDuration ?? parent.defaultDuration,
      defaultEasing: overrides.defaultEasing ?? parent.defaultEasing,
      disabled: overrides.disabled ?? parent.disabled,
    }),
    [
      overrides.reducedMotion,
      overrides.durationScale,
      overrides.defaultDuration,
      overrides.defaultEasing,
      overrides.disabled,
      parent,
    ],
  );

  return <MotionConfigContext.Provider value={value}>{children}</MotionConfigContext.Provider>;
}

/** Read the nearest configuration. */
export function useMotionConfig(): MotionConfigValue {
  return useContext(MotionConfigContext);
}
