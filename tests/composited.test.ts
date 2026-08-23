import { describe, it, expect } from 'vitest';
import {
  assertCompositedOnly,
  isCompositedProperty,
  COMPOSITED_PROPERTIES,
  LayoutShiftError,
} from '../src/core/composited';

describe('isCompositedProperty', () => {
  it('accepts the three properties the compositor owns', () => {
    expect(COMPOSITED_PROPERTIES).toEqual(['opacity', 'transform', 'filter']);
    for (const property of COMPOSITED_PROPERTIES) {
      expect(isCompositedProperty(property)).toBe(true);
    }
  });

  it('rejects everything else', () => {
    expect(isCompositedProperty('height')).toBe(false);
    expect(isCompositedProperty('backgroundColor')).toBe(false);
  });
});

describe('assertCompositedOnly', () => {
  it('passes a valid keyframe through silently', () => {
    expect(() => assertCompositedOnly({ opacity: 0, transform: 'none' })).not.toThrow();
    expect(() => assertCompositedOnly({})).not.toThrow();
  });

  it('throws a typed error naming the offending property', () => {
    try {
      assertCompositedOnly({ opacity: 1, height: '100px' });
      expect.unreachable('expected a LayoutShiftError');
    } catch (error) {
      expect(error).toBeInstanceOf(LayoutShiftError);
      expect((error as LayoutShiftError).property).toBe('height');
    }
  });

  it('suggests the composited alternative for the common mistakes', () => {
    expect(() => assertCompositedOnly({ top: 0 })).toThrow(/translateY/);
    expect(() => assertCompositedOnly({ width: 0 })).toThrow(/scaleX/);
    expect(() => assertCompositedOnly({ fontSize: 12 })).toThrow(/scale/);
  });

  it('falls back to a generic hint for unlisted properties', () => {
    expect(() => assertCompositedOnly({ backgroundColor: 'red' })).toThrow(
      /Use opacity, transform or filter/,
    );
  });
});
