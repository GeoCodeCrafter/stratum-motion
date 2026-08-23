import { describe, it, expect } from 'vitest';
import { clamp, lerp, progress, mapRange, round, pxDelta } from '../src/core/math';

describe('clamp', () => {
  it('holds values inside the range', () => {
    expect(clamp(0.5)).toBe(0.5);
    expect(clamp(-2)).toBe(0);
    expect(clamp(4)).toBe(1);
  });

  it('respects custom bounds', () => {
    expect(clamp(15, 10, 20)).toBe(15);
    expect(clamp(5, 10, 20)).toBe(10);
  });

  it('rejects an inverted range rather than returning nonsense', () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});

describe('lerp', () => {
  it('interpolates the endpoints exactly', () => {
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 1)).toBe(100);
    expect(lerp(0, 100, 0.25)).toBe(25);
  });

  it('extrapolates beyond the range when asked', () => {
    expect(lerp(0, 10, 2)).toBe(20);
  });
});

describe('progress', () => {
  it('normalises into 0..1', () => {
    expect(progress(50, 0, 100)).toBe(0.5);
    expect(progress(-10, 0, 100)).toBe(0);
    expect(progress(200, 0, 100)).toBe(1);
  });

  it('treats a zero-width range as complete instead of dividing by zero', () => {
    expect(progress(5, 5, 5)).toBe(1);
    expect(Number.isNaN(progress(5, 5, 5))).toBe(false);
  });
});

describe('mapRange', () => {
  it('remaps across ranges with clamping', () => {
    expect(mapRange(0.5, 0, 1, 0, 200)).toBe(100);
    expect(mapRange(-1, 0, 1, 0, 200)).toBe(0);
    expect(mapRange(0.5, 0, 1, 100, 0)).toBe(50);
  });
});

describe('round', () => {
  it('keeps floating point noise out of style strings', () => {
    expect(round(0.1 + 0.2)).toBe(0.3);
    expect(round(1.23456, 2)).toBe(1.23);
  });
});

describe('pxDelta', () => {
  it('maps progress onto a symmetric travel', () => {
    expect(pxDelta(0, 100)).toBe(-100);
    expect(pxDelta(0.5, 100)).toBe(0);
    expect(pxDelta(1, 100)).toBe(100);
  });
});
