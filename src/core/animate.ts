import { supportsWebAnimations } from './env';
import { resolveEasing, type Easing } from './easing';
import { toKeyframe, type MotionState } from './state';

export interface AnimateOptions {
  duration?: number;
  delay?: number;
  easing?: Easing;
  fill?: FillMode;
}

export interface AnimationHandle {
  /** Stop and leave the element wherever it happens to be. */
  cancel(): void;
  /** Jump straight to the final state. */
  finish(): void;
  /** Resolves when the animation settles, including when it is cancelled. */
  finished: Promise<void>;
}

function applyState(element: HTMLElement, state: MotionState): void {
  const keyframe = toKeyframe(state);
  if (keyframe.opacity !== undefined) element.style.opacity = String(keyframe.opacity);
  if (keyframe.transform !== undefined) element.style.transform = keyframe.transform;
  if (keyframe.filter !== undefined) element.style.filter = keyframe.filter;
}

const settled: AnimationHandle = {
  cancel() {},
  finish() {},
  finished: Promise.resolve(),
};

/**
 * Animate between two states with the Web Animations API.
 *
 * Where WAAPI is missing - jsdom, very old Safari - the element is snapped to
 * its final state instead. Content ends up correct either way; only the
 * transition between the two is lost.
 */
export function animateState(
  element: HTMLElement,
  from: MotionState,
  to: MotionState,
  options: AnimateOptions = {},
): AnimationHandle {
  const { duration = 600, delay = 0, easing = 'emphasised', fill = 'both' } = options;

  if (duration <= 0 || !supportsWebAnimations()) {
    applyState(element, to);
    return settled;
  }

  const animation = element.animate([toKeyframe(from), toKeyframe(to)], {
    duration,
    delay,
    easing: resolveEasing(easing),
    fill,
  });

  return {
    cancel: () => animation.cancel(),
    finish: () => {
      try {
        animation.finish();
      } catch {
        // finish() throws on an infinite-duration animation; nothing to do.
        animation.cancel();
      }
    },
    finished: animation.finished.then(
      () => undefined,
      () => undefined,
    ),
  };
}

/** Snap an element to a state with no transition at all. */
export function setState(element: HTMLElement, state: MotionState): void {
  applyState(element, state);
}
