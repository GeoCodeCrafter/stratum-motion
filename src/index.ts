// Components
export { Reveal, type RevealProps } from './components/Reveal';
export { Stagger, type StaggerProps } from './components/Stagger';
export { Parallax, type ParallaxProps } from './components/Parallax';
export {
  ScrollScene,
  type ScrollSceneProps,
  type ScrollSceneRenderProps,
} from './components/ScrollScene';
export { PageTransition, type PageTransitionProps } from './components/PageTransition';

// Configuration
export {
  MotionConfig,
  useMotionConfig,
  defaultMotionConfig,
  type MotionConfigProps,
  type MotionConfigValue,
  type MotionPreferenceOverride,
} from './context/MotionConfigContext';
export { useStaggerDelay } from './context/StaggerContext';

// Hooks
export { useReducedMotion, useSystemReducedMotion } from './hooks/useReducedMotion';
export { useInView, type UseInViewOptions } from './hooks/useInView';
export { useScrollProgress, type UseScrollProgressOptions } from './hooks/useScrollProgress';
export { useParallax, type UseParallaxOptions } from './hooks/useParallax';

// Presets
export {
  presets,
  presetNames,
  isPresetName,
  resolveTransition,
  toReducedTransition,
  restState,
  type PresetName,
  type PresetOptions,
  type PresetFactory,
  type Transition,
} from './presets';

// Lower-level building blocks, for anyone composing their own primitives
export {
  animateState,
  setState,
  clearState,
  type AnimateOptions,
  type AnimationHandle,
} from './core/animate';
export { toKeyframe, toStyle, mergeStates, type MotionState, type Keyframe } from './core/state';
export { buildTransform, isIdentity, type TransformParts } from './core/transform';
export { resolveEasing, easingNames, type Easing, type EasingName } from './core/easing';
export { staggerDelays, staggerDuration, type StaggerFrom } from './core/stagger';
export { scrollProgress, viewportHeight, isRectVisible, type ScrollRange } from './core/scroll';
export { parallaxOffset, parallaxTravel, requiredOverscan } from './core/parallax';
export { clamp, lerp, progress, mapRange, round } from './core/math';
export { onFrame, frameSubscriberCount, resetScheduler } from './core/scheduler';
export {
  observeIntersection,
  observerPoolSize,
  resetObserverPool,
  type ObserveOptions,
} from './core/observer';
export {
  COMPOSITED_PROPERTIES,
  isCompositedProperty,
  assertCompositedOnly,
  LayoutShiftError,
  type CompositedProperty,
} from './core/composited';
export { resolvePreference, type PreferenceInputs } from './core/preference';
export {
  prefersReducedMotion,
  subscribeReducedMotion,
  REDUCED_MOTION_QUERY,
} from './core/reduced-motion';
export { isServer, canUseDOM, useIsomorphicLayoutEffect } from './core/env';
