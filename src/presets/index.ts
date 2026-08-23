import type { MotionState } from '../core/state';

export interface PresetOptions {
  /** Travel distance in pixels for the directional presets. */
  distance?: number;
  /** Starting scale for the scaling presets. */
  scaleFrom?: number;
  /** Starting blur radius in pixels. */
  blur?: number;
}

export interface Transition {
  from: MotionState;
  to: MotionState;
}

export type PresetName =
  | 'fade'
  | 'fadeUp'
  | 'fadeDown'
  | 'fadeLeft'
  | 'fadeRight'
  | 'scaleIn'
  | 'scaleOut'
  | 'blurIn'
  | 'rise'
  | 'tilt';

export type PresetFactory = (options?: PresetOptions) => Transition;

const rest: MotionState = { opacity: 1, x: 0, y: 0, scale: 1, blur: 0 };

export const presets: Record<PresetName, PresetFactory> = {
  fade: () => ({ from: { opacity: 0 }, to: { opacity: 1 } }),

  fadeUp: ({ distance = 24 } = {}) => ({
    from: { opacity: 0, y: distance },
    to: { opacity: 1, y: 0 },
  }),

  fadeDown: ({ distance = 24 } = {}) => ({
    from: { opacity: 0, y: -distance },
    to: { opacity: 1, y: 0 },
  }),

  fadeLeft: ({ distance = 24 } = {}) => ({
    from: { opacity: 0, x: distance },
    to: { opacity: 1, x: 0 },
  }),

  fadeRight: ({ distance = 24 } = {}) => ({
    from: { opacity: 0, x: -distance },
    to: { opacity: 1, x: 0 },
  }),

  scaleIn: ({ scaleFrom = 0.94 } = {}) => ({
    from: { opacity: 0, scale: scaleFrom },
    to: { opacity: 1, scale: 1 },
  }),

  scaleOut: ({ scaleFrom = 1.06 } = {}) => ({
    from: { opacity: 0, scale: scaleFrom },
    to: { opacity: 1, scale: 1 },
  }),

  blurIn: ({ blur = 8 } = {}) => ({
    from: { opacity: 0, blur },
    to: { opacity: 1, blur: 0 },
  }),

  rise: ({ distance = 40, scaleFrom = 0.98 } = {}) => ({
    from: { opacity: 0, y: distance, scale: scaleFrom },
    to: { opacity: 1, y: 0, scale: 1 },
  }),

  tilt: ({ distance = 16 } = {}) => ({
    from: { opacity: 0, y: distance, rotateX: -8 },
    to: { opacity: 1, y: 0, rotateX: 0 },
  }),
};

export const presetNames: readonly PresetName[] = Object.keys(presets) as PresetName[];

export function isPresetName(value: string): value is PresetName {
  return Object.prototype.hasOwnProperty.call(presets, value);
}

/** Resolve a preset name or a literal transition into a transition. */
export function resolveTransition(
  preset: PresetName | Transition,
  options?: PresetOptions,
): Transition {
  return typeof preset === 'string' ? presets[preset](options) : preset;
}

/**
 * The reduced-motion counterpart of any transition: the same start and end
 * opacity, no movement at all. Vestibular triggers are movement, not fading,
 * so this keeps the cue while removing the harm.
 */
export function toReducedTransition(transition: Transition): Transition {
  return {
    from: { opacity: transition.from.opacity ?? 0 },
    to: { opacity: transition.to.opacity ?? 1 },
  };
}

/** The neutral resting state every preset animates towards. */
export const restState: MotionState = rest;
