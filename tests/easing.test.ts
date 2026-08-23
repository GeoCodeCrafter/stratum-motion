import { describe, it, expect } from 'vitest';
import { resolveEasing, easingNames } from '../src/core/easing';

describe('resolveEasing', () => {
  it('resolves every documented name to a CSS timing function', () => {
    for (const name of easingNames) {
      const value = resolveEasing(name);
      expect(value).toMatch(/^(linear|ease|cubic-bezier\(.+\))$/);
    }
  });

  it('defaults to the emphasised curve', () => {
    expect(resolveEasing()).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  });

  it('passes unknown strings through so callers can supply their own curve', () => {
    expect(resolveEasing('cubic-bezier(0.1, 0.2, 0.3, 0.4)')).toBe('cubic-bezier(0.1, 0.2, 0.3, 0.4)');
    expect(resolveEasing('steps(4, end)')).toBe('steps(4, end)');
  });

  it('is not fooled by inherited object properties', () => {
    expect(resolveEasing('toString')).toBe('toString');
    expect(resolveEasing('constructor')).toBe('constructor');
  });
});
