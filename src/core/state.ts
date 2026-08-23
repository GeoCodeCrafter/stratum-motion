import type { CSSProperties } from 'react';
import { assertCompositedOnly } from './composited';
import { buildTransform, type TransformParts } from './transform';
import { round } from './math';

/**
 * A visual state, expressed only in properties the compositor owns.
 * There is no `height` or `top` here, and that is the point.
 */
export interface MotionState extends TransformParts {
  opacity?: number;
  /** Convenience for `filter: blur(Npx)`. */
  blur?: number;
}

export type Keyframe = {
  opacity?: number;
  transform?: string;
  filter?: string;
};

const TRANSFORM_KEYS = [
  'x',
  'y',
  'z',
  'scale',
  'scaleX',
  'scaleY',
  'rotate',
  'rotateX',
  'rotateY',
  'skewX',
  'skewY',
] as const;

function hasTransform(state: MotionState): boolean {
  return TRANSFORM_KEYS.some((key) => state[key] !== undefined);
}

/** Flatten a {@link MotionState} into a CSS keyframe, validating as it goes. */
export function toKeyframe(state: MotionState): Keyframe {
  const keyframe: Keyframe = {};

  if (state.opacity !== undefined) keyframe.opacity = round(state.opacity, 4);
  if (hasTransform(state)) keyframe.transform = buildTransform(state);
  if (state.blur !== undefined) keyframe.filter = state.blur > 0 ? `blur(${round(state.blur)}px)` : 'none';

  assertCompositedOnly(keyframe as Record<string, unknown>);
  return keyframe;
}

/** The same flattening, typed for React's `style` prop. */
export function toStyle(state: MotionState): CSSProperties {
  return toKeyframe(state) as CSSProperties;
}

/** Merge two states, with the second winning on conflicts. */
export function mergeStates(base: MotionState, overrides: MotionState): MotionState {
  return { ...base, ...overrides };
}
