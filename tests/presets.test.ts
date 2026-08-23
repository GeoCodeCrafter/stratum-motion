import { describe, it, expect } from 'vitest';
import {
  presets,
  presetNames,
  isPresetName,
  resolveTransition,
  toReducedTransition,
} from '../src/presets';
import { toKeyframe } from '../src/core/state';

describe('every preset', () => {
  it('ends fully visible and untransformed', () => {
    for (const name of presetNames) {
      const { to } = presets[name]();
      expect(to.opacity ?? 1).toBe(1);
      const keyframe = toKeyframe(to);
      if (keyframe.transform) expect(keyframe.transform).toMatch(/translate3d\(0px, 0px, 0px\)|scale\(1\)/);
      if (keyframe.filter) expect(keyframe.filter).toBe('none');
    }
  });

  it('starts invisible, so nothing pops in half-faded', () => {
    for (const name of presetNames) {
      expect(presets[name]().from.opacity).toBe(0);
    }
  });

  it('produces only composited keyframes', () => {
    for (const name of presetNames) {
      const { from, to } = presets[name]();
      for (const state of [from, to]) {
        for (const key of Object.keys(toKeyframe(state))) {
          expect(['opacity', 'transform', 'filter']).toContain(key);
        }
      }
    }
  });

  it('honours the distance option on the directional presets', () => {
    expect(presets.fadeUp({ distance: 100 }).from.y).toBe(100);
    expect(presets.fadeDown({ distance: 100 }).from.y).toBe(-100);
    expect(presets.fadeLeft({ distance: 100 }).from.x).toBe(100);
    expect(presets.fadeRight({ distance: 100 }).from.x).toBe(-100);
  });

  it('moves in the direction it is named after', () => {
    // fadeUp travels upwards, so it starts below its resting place.
    expect(presets.fadeUp().from.y).toBeGreaterThan(0);
    expect(presets.fadeDown().from.y).toBeLessThan(0);
  });

  it('exposes exactly the documented names', () => {
    expect(presetNames).toEqual([
      'fade',
      'fadeUp',
      'fadeDown',
      'fadeLeft',
      'fadeRight',
      'scaleIn',
      'scaleOut',
      'blurIn',
      'rise',
      'tilt',
    ]);
  });
});

describe('isPresetName', () => {
  it('recognises real presets and nothing else', () => {
    expect(isPresetName('fadeUp')).toBe(true);
    expect(isPresetName('nope')).toBe(false);
    expect(isPresetName('constructor')).toBe(false);
  });
});

describe('resolveTransition', () => {
  it('resolves a name', () => {
    expect(resolveTransition('fade')).toEqual({ from: { opacity: 0 }, to: { opacity: 1 } });
  });

  it('passes a literal transition straight through', () => {
    const literal = { from: { opacity: 0.2 }, to: { opacity: 0.8 } };
    expect(resolveTransition(literal)).toBe(literal);
  });

  it('forwards preset options', () => {
    expect(resolveTransition('rise', { distance: 12 }).from.y).toBe(12);
  });
});

describe('toReducedTransition', () => {
  it('strips every trace of movement', () => {
    const reduced = toReducedTransition(presets.rise());
    expect(reduced.from).toEqual({ opacity: 0 });
    expect(reduced.to).toEqual({ opacity: 1 });
    expect(toKeyframe(reduced.from).transform).toBeUndefined();
  });

  it('keeps the opacity endpoints of an unusual transition', () => {
    const reduced = toReducedTransition({ from: { opacity: 0.3, y: 50 }, to: { opacity: 0.9 } });
    expect(reduced.from.opacity).toBe(0.3);
    expect(reduced.to.opacity).toBe(0.9);
  });

  it('leaves no transform in any reduced preset', () => {
    for (const name of presetNames) {
      const reduced = toReducedTransition(presets[name]());
      expect(toKeyframe(reduced.from)).toEqual({ opacity: expect.any(Number) });
    }
  });
});
