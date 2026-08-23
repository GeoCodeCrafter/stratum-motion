import { clamp } from './math';

/**
 * Which slice of the scroll to measure.
 *
 * - `cover`   0 as the element enters the viewport, 1 as it leaves
 * - `contain` 0 when it is fully visible, 1 when it starts to leave
 * - `enter`   0 as it enters, 1 once it is fully on screen
 * - `exit`    0 as it starts to leave, 1 once it is gone
 */
export type ScrollRange = 'cover' | 'contain' | 'enter' | 'exit';

export interface Rect {
  top: number;
  height: number;
}

/**
 * Scroll progress for a rect, expressed 0..1. Pure maths on a measured rect,
 * so it is testable without a browser and without a scroll position.
 */
export function scrollProgress(rect: Rect, viewportHeight: number, range: ScrollRange = 'cover'): number {
  const { top, height } = rect;
  const bottom = top + height;

  switch (range) {
    case 'cover': {
      // Travels from "top edge at viewport bottom" to "bottom edge at viewport top".
      const total = viewportHeight + height;
      return clamp((viewportHeight - top) / total);
    }
    case 'contain': {
      // Only meaningful once the element is shorter than the viewport;
      // taller elements fall back to cover so the value still moves.
      const total = viewportHeight - height;
      if (total <= 0) return scrollProgress(rect, viewportHeight, 'cover');
      return clamp((viewportHeight - bottom) / total);
    }
    case 'enter': {
      const total = Math.min(viewportHeight, height) || 1;
      return clamp((viewportHeight - top) / total);
    }
    case 'exit': {
      const total = Math.min(viewportHeight, height) || 1;
      return clamp(-top / total);
    }
    default:
      return 0;
  }
}

/** Read the viewport height, tolerating a missing window. */
export function viewportHeight(): number {
  if (typeof window === 'undefined') return 0;
  return window.innerHeight || document.documentElement.clientHeight || 0;
}

/** True when any part of the rect is on screen. */
export function isRectVisible(rect: Rect, height: number, margin = 0): boolean {
  return rect.top - margin < height && rect.top + rect.height + margin > 0;
}
