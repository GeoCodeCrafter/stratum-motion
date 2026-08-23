import {
  createElement,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { animateState, setState } from '../core/animate';
import { useIsomorphicLayoutEffect } from '../core/env';
import type { Easing } from '../core/easing';
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
  const primed = useRef(false);

  const transition = useMemo<Transition>(() => {
    const base = resolveTransition(preset, { distance, scaleFrom, blur });
    return reduced ? toReducedTransition(base) : base;
  }, [preset, distance, scaleFrom, blur, reduced]);

  const timing = useMemo(() => {
    const base = duration ?? config.defaultDuration;
    return {
      duration: config.disabled ? 0 : Math.round((reduced ? Math.min(base, REDUCED_DURATION) : base) * config.durationScale),
      delay: config.disabled ? 0 : Math.round((delay + staggerDelay) * config.durationScale),
      easing: easing ?? config.defaultEasing,
    };
  }, [duration, delay, easing, staggerDelay, config, reduced]);

  // Apply the hidden state before first paint, never during SSR.
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element || config.disabled || primed.current || revealed) return;
    primed.current = true;
    setState(element, transition.from);
  }, [config.disabled, transition, revealed]);

  const inView = useInView(ref, { once, amount, rootMargin, skip: config.disabled });

  const handleRevealed = useCallback(() => {
    setRevealed(true);
    onReveal?.();
  }, [onReveal]);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (config.disabled) {
      setState(element, transition.to);
      handleRevealed();
      return;
    }

    if (!inView) {
      if (!once && revealed) {
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
  }, [inView, once, transition, timing, config.disabled, handleRevealed]);

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
