import { describe, it, expect } from 'vitest';
import { staggerDelays, staggerDuration } from '../src/core/stagger';

describe('staggerDelays', () => {
  it('handles the degenerate counts', () => {
    expect(staggerDelays(0, 100)).toEqual([]);
    expect(staggerDelays(-3, 100)).toEqual([]);
    expect(staggerDelays(1, 100)).toEqual([0]);
  });

  it('steps forwards from the first child', () => {
    expect(staggerDelays(4, 50)).toEqual([0, 50, 100, 150]);
  });

  it('steps backwards from the last child', () => {
    expect(staggerDelays(4, 50, 'last')).toEqual([150, 100, 50, 0]);
  });

  it('radiates out from the centre', () => {
    expect(staggerDelays(5, 100, 'center')).toEqual([200, 100, 0, 100, 200]);
  });

  it('normalises an even centre group so it starts immediately', () => {
    expect(staggerDelays(4, 100, 'center')).toEqual([100, 0, 0, 100]);
  });

  it('closes in from the edges', () => {
    expect(staggerDelays(5, 100, 'edges')).toEqual([0, 100, 200, 100, 0]);
  });

  it('always starts someone at zero', () => {
    for (const from of ['first', 'last', 'center', 'edges'] as const) {
      expect(Math.min(...staggerDelays(6, 40, from))).toBe(0);
    }
  });
});

describe('staggerDuration', () => {
  it('reports the last start time', () => {
    expect(staggerDuration(4, 50)).toBe(150);
    expect(staggerDuration(5, 100, 'center')).toBe(200);
    expect(staggerDuration(0, 100)).toBe(0);
  });
});
