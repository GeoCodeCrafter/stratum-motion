import { describe, it, expect } from 'vitest';
import { resolvePreference } from '../src/core/preference';

const base = { reducedMotion: 'auto', disabled: false } as const;

describe('resolvePreference', () => {
  it('follows the system in auto mode', () => {
    expect(resolvePreference(base, true)).toBe(true);
    expect(resolvePreference(base, false)).toBe(false);
  });

  it('forces reduction regardless of the system', () => {
    expect(resolvePreference({ ...base, reducedMotion: 'reduce' }, false)).toBe(true);
  });

  it('overrides the system the other way for an in-app toggle', () => {
    expect(resolvePreference({ ...base, reducedMotion: 'no-preference' }, true)).toBe(false);
  });

  it('treats disabled as reduced, whatever else is set', () => {
    expect(resolvePreference({ reducedMotion: 'no-preference', disabled: true }, false)).toBe(true);
  });
});
