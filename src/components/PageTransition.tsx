import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { animateState, setState } from '../core/animate';
import { resolveTransition, toReducedTransition, type PresetName, type Transition } from '../presets';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useMotionConfig } from '../context/MotionConfigContext';
import type { Easing } from '../core/easing';

export interface PageTransitionProps {
  children?: ReactNode;
  /** Change this to trigger a transition - in Next, the pathname. */
  transitionKey: string;
  as?: ElementType;
  preset?: PresetName | Transition;
  /** Milliseconds for the outgoing half. Defaults to a third of `duration`. */
  exitDuration?: number;
  duration?: number;
  easing?: Easing;
  className?: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

/**
 * Cross-fade between routes.
 *
 * The outgoing children stay mounted until their exit animation finishes,
 * then the new ones swap in and animate. Exit is deliberately much shorter
 * than entry: a slow exit is the part users read as "this site is sluggish",
 * because nothing they asked for is on screen yet.
 */
export function PageTransition({
  children,
  transitionKey,
  as = 'div',
  preset = 'fade',
  duration,
  exitDuration,
  easing,
  className,
  style,
  ...rest
}: PageTransitionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const config = useMotionConfig();
  const reduced = useReducedMotion();

  const [rendered, setRendered] = useState({ key: transitionKey, children });
  const pending = useRef<{ key: string; children: ReactNode } | null>(null);

  useEffect(() => {
    // Same route, updated children: keep them in sync without animating.
    if (transitionKey === rendered.key) {
      if (children !== rendered.children) setRendered({ key: transitionKey, children });
      return;
    }

    pending.current = { key: transitionKey, children };
    const element = ref.current;

    const base = resolveTransition(preset);
    const transition = reduced ? toReducedTransition(base) : base;
    const enterDuration = config.disabled ? 0 : Math.round((duration ?? config.defaultDuration) * config.durationScale);
    const leaveDuration = config.disabled ? 0 : exitDuration ?? Math.round(enterDuration / 3);

    if (!element || config.disabled) {
      setRendered({ key: transitionKey, children });
      return;
    }

    let cancelled = false;
    const exit = animateState(element, transition.to, transition.from, {
      duration: leaveDuration,
      easing: easing ?? config.defaultEasing,
    });

    void exit.finished.then(() => {
      if (cancelled) return;
      const next = pending.current;
      if (next) setRendered(next);
      setState(element, transition.from);
      animateState(element, transition.from, transition.to, {
        duration: enterDuration,
        easing: easing ?? config.defaultEasing,
      });
    });

    return () => {
      cancelled = true;
      exit.cancel();
    };
    // `rendered` is read, not tracked: reacting to it would re-enter the
    // transition it just completed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transitionKey, children, preset, duration, exitDuration, easing, reduced, config]);

  return createElement(
    as,
    {
      ...rest,
      ref,
      className,
      style,
      'data-stratum': 'page-transition',
      'data-stratum-key': rendered.key,
    },
    rendered.children,
  );
}
