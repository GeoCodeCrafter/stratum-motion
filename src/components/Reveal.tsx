import {
  createElement,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { animateState, clearState, setState } from '../core/animate';
import { useIsomorphicLayoutEffect } from '../core/env';
import type { Easing } from '../core/easing';
import { prefersReducedMotion } from '../core/reduced-motion';
import { resolvePreference } from '../core/preference';
import {
  resolveTransition,
  toReducedTransition,
  type PresetName,
  type PresetOptions,
  type Transition,
} from '../presets';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMotionConfig } from '../context/MotionConfigContext';
import { useStaggerDelay } from '../context/StaggerContext';

/** Reduced motion still gets a cue, just a short one with no movement. */
const REDUCED_DURATION = 200;

export interface RevealProps extends PresetOptions {
  children?: ReactNode;
  /** Element or component to render. Defaults to a div. */
  as?: ElementType;
  preset?: PresetName | Transition;
  duration?: number;
  delay?: number;
  easing?: Easing;
  /** Reveal once and stay revealed, or re-run on every entry. */
  once?: boolean;
  /** Fraction of the element that must be visible to trigger. */
  amount?: number;
  rootMargin?: string;
  className?: string;
  style?: CSSProperties;
  onReveal?: () => void;
  [key: string]: unknown;
}

/**
 * Animate an element in when it scrolls into view.
 *
 * The server renders the element in its *final* state - no opacity zero, no
 * transform. The hidden starting state is applied on the client in a layout
 * effect, before the browser paints. That ordering is what stops the two
 * classic failure modes: content that never appears when JavaScript fails,
 * and a flash of visible content before the animation starts.
 */
export function Reveal({
  children,
  as = 'div',
  preset = 'fadeUp',
  duration,
  delay = 0,
  easing,
  once = true,
  amount = 0.2,
  rootMargin = '0px',
  distance,
  scaleFrom,
  blur,
  className,
  style,
  onReveal,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const config = useMotionConfig();
  const reduced = useReducedMotion();
  const staggerDelay = useStaggerDelay();
  const [revealed, setRevealed] = useState(false);

  /**
   * Resolved inside the effects, and from a live media query rather than from
   * the store. `useSyncExternalStore` reports the server snapshot until
   * hydration finishes, and priming an element from that stale value puts a
   * transform on screen for someone who asked for no movement at all.
   */
  const plan = useCallback(() => {
    const isReduced = resolvePreference(config, prefersReducedMotion());
    const base = resolveTransition(preset, { distance, scaleFrom, blur });
    const requested = duration ?? config.defaultDuration;
    const scaled = isReduced ? Math.min(requested, REDUCED_DURATION) : requested;

    return {
      transition: isReduced ? toReducedTransition(base) : base,
      timing: {
        duration: config.disabled ? 0 : Math.round(scaled * config.durationScale),
        delay: config.disabled ? 0 : Math.round((delay + staggerDelay) * config.durationScale),
        easing: easing ?? config.defaultEasing,
      },
    };
  }, [config, preset, distance, scaleFrom, blur, duration, delay, staggerDelay, easing]);

  // Apply the hidden state before first paint, never during SSR.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || config.disabled || revealed) return;

    // Clear first: switching to the reduced transition mid-life leaves no
    // keyframe to overwrite a transform the previous one wrote.
    clearState(element);
    setState(element, plan().transition.from);
  }, [config.disabled, plan, revealed, reduced]);

  const inView = useInView(ref, { once, amount, rootMargin, skip: config.disabled });

  const handleRevealed = useCallback(() => {
    setRevealed(true);
    onReveal?.();
  }, [onReveal]);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { transition, timing } = plan();

    if (config.disabled) {
      clearState(element);
      setState(element, transition.to);
      handleRevealed();
      return;
    }

    if (!inView) {
      if (!once && revealed) {
        clearState(element);
        setState(element, transition.from);
        setRevealed(false);
      }
      return;
    }

    const animation = animateState(element, transition.from, transition.to, timing);
    let cancelled = false;
    void animation.finished.then(() => {
      if (!cancelled) handleRevealed();
    });

    return () => {
      cancelled = true;
    };
    // `revealed` is deliberately absent: re-running on our own state change
    // would restart the animation the moment it finished.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, once, plan, config.disabled, handleRevealed, reduced]);

  return createElement(
    as,
    {
      ...rest,
      ref,
      className,
      style,
      'data-stratum': 'reveal',
      'data-stratum-state': revealed ? 'revealed' : inView ? 'revealing' : 'idle',
    },
    children,
  );
}
