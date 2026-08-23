import { describe, it, expect } from 'vitest';
import { toKeyframe, toStyle, mergeStates } from '../src/core/state';
import { LayoutShiftError, assertCompositedOnly } from '../src/core/composited';

describe('toKeyframe', () => {
  it('emits only opacity when only opacity was asked for', () => {
    expect(toKeyframe({ opacity: 0 })).toEqual({ opacity: 0 });
  });

  it('collapses transform parts into one string', () => {
    expect(toKeyframe({ opacity: 1, y: 20, scale: 0.9 })).toEqual({
      opacity: 1,
      transform: 'translate3d(0px, 20px, 0px) scale(0.9)',
    });
  });

  it('omits transform entirely when no transform part is present', () => {
    expect(toKeyframe({ opacity: 0.5 }).transform).toBeUndefined();
  });

  it('maps blur onto a filter, and zero blur onto none', () => {
    expect(toKeyframe({ blur: 8 }).filter).toBe('blur(8px)');
    expect(toKeyframe({ blur: 0 }).filter).toBe('none');
  });

  it('produces only composited properties, whatever the input', () => {
    const keyframe = toKeyframe({ opacity: 1, x: 1, y: 2, scale: 3, rotate: 4, blur: 5 });
    for (const key of Object.keys(keyframe)) {
      expect(['opacity', 'transform', 'filter']).toContain(key);
    }
  });

  it('never lets an unknown property reach the DOM', () => {
    const rogue = { opacity: 1, height: 100 } as unknown as Parameters<typeof toKeyframe>[0];
    expect(() => toKeyframe(rogue)).not.toThrow();
    expect(toKeyframe(rogue)).toEqual({ opacity: 1 });
  });
});

describe('toStyle', () => {
  it('is usable directly as a React style prop', () => {
    const style = toStyle({ opacity: 0, y: 10 });
    expect(style.opacity).toBe(0);
    expect(style.transform).toContain('translate3d');
  });
});

describe('mergeStates', () => {
  it('lets the override win', () => {
    expect(mergeStates({ opacity: 0, y: 10 }, { opacity: 1 })).toEqual({ opacity: 1, y: 10 });
  });
});

describe('the guard is still reachable', () => {
  it('throws when a keyframe is built by hand with a layout property', () => {
    expect(() => assertCompositedOnly({ opacity: 1, marginTop: '10px' })).toThrow(LayoutShiftError);
  });
});
