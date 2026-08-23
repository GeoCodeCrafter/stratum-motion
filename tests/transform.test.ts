import { describe, it, expect } from 'vitest';
import { buildTransform, isIdentity } from '../src/core/transform';

describe('buildTransform', () => {
  it('returns none for an empty part list', () => {
    expect(buildTransform({})).toBe('none');
  });

  it('uses translate3d so the element gets its own layer', () => {
    expect(buildTransform({ y: 24 })).toBe('translate3d(0px, 24px, 0px)');
  });

  it('accepts string lengths for percentage travel', () => {
    expect(buildTransform({ x: '50%' })).toBe('translate3d(50%, 0px, 0px)');
  });

  it('emits parts in a fixed order regardless of key order', () => {
    const a = buildTransform({ scale: 2, rotate: 45, y: 10 });
    const b = buildTransform({ y: 10, rotate: 45, scale: 2 });
    expect(a).toBe(b);
    expect(a).toBe('translate3d(0px, 10px, 0px) rotate(45deg) scale(2)');
  });

  it('rounds away floating point noise', () => {
    expect(buildTransform({ y: 0.1 + 0.2 })).toBe('translate3d(0px, 0.3px, 0px)');
  });

  it('keeps extra precision on scale, where small differences show', () => {
    expect(buildTransform({ scale: 0.98765 })).toBe('scale(0.9877)');
  });
});

describe('isIdentity', () => {
  it('recognises the no-op transforms', () => {
    expect(isIdentity({})).toBe(true);
    expect(isIdentity({ x: 0, y: 0 })).toBe(true);
    expect(isIdentity({ y: 1 })).toBe(false);
  });
});
