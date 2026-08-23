import { describe, it, expect } from 'vitest';
import { parallaxOffset, parallaxTravel, requiredOverscan } from '../src/core/parallax';

describe('parallaxOffset', () => {
  it('is zero at the midpoint, where the viewer is looking at it', () => {
    expect(parallaxOffset(0.5, 0.3, 1200)).toBe(0);
  });

  it('is symmetric about the midpoint', () => {
    expect(parallaxOffset(0, 0.3, 1200)).toBe(-parallaxOffset(1, 0.3, 1200));
  });

  it('scales with speed', () => {
    expect(parallaxOffset(0, 0.2, 1000)).toBe(100);
    expect(parallaxOffset(0, 0.4, 1000)).toBe(200);
  });

  it('inverts with a negative speed', () => {
    expect(parallaxOffset(0, -0.2, 1000)).toBe(-100);
  });

  it('does not move at all at zero speed', () => {
    for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
      expect(parallaxOffset(progress, 0, 2000)).toBe(0);
    }
  });
});

describe('parallaxTravel', () => {
  it('is the distance the element is on screen for', () => {
    expect(parallaxTravel(400, 800)).toBe(1200);
  });
});

describe('requiredOverscan', () => {
  it('reports the padding needed to hide a layer edge', () => {
    // 0.2 * 1200 = 240px of travel in each direction.
    expect(requiredOverscan(0.2, 1200)).toBe(240);
  });

  it('ignores the sign, since the gap appears either way', () => {
    expect(requiredOverscan(-0.2, 1200)).toBe(240);
  });

  it('rounds up so a fractional pixel never shows through', () => {
    expect(requiredOverscan(0.1, 1005)).toBe(101);
  });
});
