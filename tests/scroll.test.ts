import { describe, it, expect } from 'vitest';
import { scrollProgress, isRectVisible, viewportHeight } from '../src/core/scroll';
import { setViewportHeight } from './helpers/rect';

const VIEWPORT = 800;

describe('scrollProgress: cover', () => {
  it('is zero while the element sits just below the fold', () => {
    expect(scrollProgress({ top: VIEWPORT, height: 400 }, VIEWPORT)).toBe(0);
  });

  it('is one once the element has passed above the viewport', () => {
    expect(scrollProgress({ top: -400, height: 400 }, VIEWPORT)).toBe(1);
  });

  it('is a half when the element straddles the middle of its travel', () => {
    // Travel is viewport + height = 1200; halfway is top at 800 - 600 = 200.
    expect(scrollProgress({ top: 200, height: 400 }, VIEWPORT)).toBe(0.5);
  });

  it('clamps rather than running past the ends', () => {
    expect(scrollProgress({ top: 5000, height: 400 }, VIEWPORT)).toBe(0);
    expect(scrollProgress({ top: -5000, height: 400 }, VIEWPORT)).toBe(1);
  });

  it('increases monotonically as the element scrolls up', () => {
    const samples = [800, 600, 400, 200, 0, -200, -400].map((top) =>
      scrollProgress({ top, height: 400 }, VIEWPORT),
    );
    const sorted = [...samples].sort((a, b) => a - b);
    expect(samples).toEqual(sorted);
  });
});

describe('scrollProgress: contain', () => {
  it('is zero before the element is fully on screen', () => {
    expect(scrollProgress({ top: 700, height: 200 }, VIEWPORT, 'contain')).toBe(0);
  });

  it('reaches one once the element has fully left the top', () => {
    expect(scrollProgress({ top: -200, height: 200 }, VIEWPORT, 'contain')).toBe(1);
  });

  it('falls back to cover for elements taller than the viewport', () => {
    const tall = { top: 100, height: 1600 };
    expect(scrollProgress(tall, VIEWPORT, 'contain')).toBe(scrollProgress(tall, VIEWPORT, 'cover'));
  });
});

describe('scrollProgress: enter and exit', () => {
  it('completes entry once the element is a viewport deep', () => {
    expect(scrollProgress({ top: 800, height: 400 }, VIEWPORT, 'enter')).toBe(0);
    expect(scrollProgress({ top: 400, height: 400 }, VIEWPORT, 'enter')).toBe(1);
  });

  it('starts exit only once the top edge passes the fold', () => {
    expect(scrollProgress({ top: 0, height: 400 }, VIEWPORT, 'exit')).toBe(0);
    expect(scrollProgress({ top: -400, height: 400 }, VIEWPORT, 'exit')).toBe(1);
  });

  it('survives a zero-height element', () => {
    expect(() => scrollProgress({ top: 0, height: 0 }, VIEWPORT, 'enter')).not.toThrow();
  });
});

describe('isRectVisible', () => {
  it('reports overlap with the viewport', () => {
    expect(isRectVisible({ top: 100, height: 100 }, VIEWPORT)).toBe(true);
    expect(isRectVisible({ top: 900, height: 100 }, VIEWPORT)).toBe(false);
    expect(isRectVisible({ top: -200, height: 100 }, VIEWPORT)).toBe(false);
  });

  it('honours a margin so work can start just off screen', () => {
    expect(isRectVisible({ top: 850, height: 100 }, VIEWPORT, 100)).toBe(true);
  });
});

describe('viewportHeight', () => {
  it('reads the window', () => {
    setViewportHeight(640);
    expect(viewportHeight()).toBe(640);
  });
});
