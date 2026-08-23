import { describe, it, expect } from 'vitest';
import * as api from '../src/index';

/**
 * A package's exports are its contract. This locks the list so a rename or an
 * accidental deletion shows up as a failing test rather than as someone
 * else's broken build.
 */
const EXPECTED = [
  'COMPOSITED_PROPERTIES',
  'LayoutShiftError',
  'MotionConfig',
  'PageTransition',
  'Parallax',
  'REDUCED_MOTION_QUERY',
  'Reveal',
  'ScrollScene',
  'Stagger',
  'animateState',
  'assertCompositedOnly',
  'buildTransform',
  'canUseDOM',
  'clamp',
  'defaultMotionConfig',
  'easingNames',
  'frameSubscriberCount',
  'isCompositedProperty',
  'isIdentity',
  'isPresetName',
  'isRectVisible',
  'isServer',
  'lerp',
  'mapRange',
  'mergeStates',
  'observeIntersection',
  'observerPoolSize',
  'onFrame',
  'parallaxOffset',
  'parallaxTravel',
  'prefersReducedMotion',
  'presetNames',
  'presets',
  'progress',
  'requiredOverscan',
  'resetObserverPool',
  'resetScheduler',
  'resolveEasing',
  'resolveTransition',
  'restState',
  'round',
  'scrollProgress',
  'setState',
  'staggerDelays',
  'staggerDuration',
  'subscribeReducedMotion',
  'toKeyframe',
  'toReducedTransition',
  'toStyle',
  'useInView',
  'useIsomorphicLayoutEffect',
  'useMotionConfig',
  'useParallax',
  'useReducedMotion',
  'useScrollProgress',
  'useStaggerDelay',
  'useSystemReducedMotion',
  'viewportHeight',
];

describe('the public API', () => {
  it('exports exactly what it documents', () => {
    expect(Object.keys(api).sort()).toEqual([...EXPECTED].sort());
  });

  it('exports the five components as functions', () => {
    for (const name of ['Reveal', 'Stagger', 'Parallax', 'ScrollScene', 'PageTransition'] as const) {
      expect(typeof api[name]).toBe('function');
    }
  });

  it('exports every hook as a function', () => {
    for (const name of Object.keys(api).filter((key) => key.startsWith('use'))) {
      expect(typeof api[name as keyof typeof api]).toBe('function');
    }
  });

  it('has no undefined export, which is what a bad barrel file looks like', () => {
    for (const [name, value] of Object.entries(api)) {
      expect(value, `${name} is undefined`).toBeDefined();
    }
  });
});
