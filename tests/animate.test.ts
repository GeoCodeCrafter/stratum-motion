import { describe, it, expect, afterEach, vi } from 'vitest';
import { animateState, setState } from '../src/core/animate';

function stubWebAnimations() {
  const calls: Array<{ keyframes: Keyframe[]; options: KeyframeAnimationOptions }> = [];
  const animate = vi.fn(function (this: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
    calls.push({ keyframes, options });
    return {
      finished: Promise.resolve(),
      cancel: vi.fn(),
      finish: vi.fn(),
    } as unknown as Animation;
  });
  Object.defineProperty(Element.prototype, 'animate', {
    value: animate,
    writable: true,
    configurable: true,
  });
  return {
    calls,
    animate,
    restore: () => {
      delete (Element.prototype as { animate?: unknown }).animate;
    },
  };
}

afterEach(() => {
  delete (Element.prototype as { animate?: unknown }).animate;
});

describe('animateState without the Web Animations API', () => {
  it('snaps to the final state so content is never left hidden', () => {
    const element = document.createElement('div');
    animateState(element, { opacity: 0, y: 20 }, { opacity: 1, y: 0 });

    expect(element.style.opacity).toBe('1');
    expect(element.style.transform).toBe('translate3d(0px, 0px, 0px)');
  });

  it('resolves its finished promise immediately', async () => {
    const element = document.createElement('div');
    await expect(animateState(element, { opacity: 0 }, { opacity: 1 }).finished).resolves.toBeUndefined();
  });

  it('is a no-op to cancel or finish', () => {
    const handle = animateState(document.createElement('div'), { opacity: 0 }, { opacity: 1 });
    expect(() => handle.cancel()).not.toThrow();
    expect(() => handle.finish()).not.toThrow();
  });
});

describe('animateState with the Web Animations API', () => {
  it('passes both keyframes and the resolved easing', () => {
    const waapi = stubWebAnimations();
    const element = document.createElement('div');

    animateState(element, { opacity: 0 }, { opacity: 1 }, { duration: 400, delay: 100, easing: 'easeOut' });

    expect(waapi.calls).toHaveLength(1);
    const call = waapi.calls[0]!;
    expect(call.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(call.options.duration).toBe(400);
    expect(call.options.delay).toBe(100);
    expect(call.options.easing).toBe('cubic-bezier(0.33, 1, 0.68, 1)');
    expect(call.options.fill).toBe('both');
    waapi.restore();
  });

  it('skips the animation entirely at zero duration', () => {
    const waapi = stubWebAnimations();
    const element = document.createElement('div');

    animateState(element, { opacity: 0 }, { opacity: 1 }, { duration: 0 });

    expect(waapi.animate).not.toHaveBeenCalled();
    expect(element.style.opacity).toBe('1');
    waapi.restore();
  });
});

describe('setState', () => {
  it('writes only the properties the state mentions', () => {
    const element = document.createElement('div');
    element.style.transform = 'scale(2)';

    setState(element, { opacity: 0.5 });

    expect(element.style.opacity).toBe('0.5');
    expect(element.style.transform).toBe('scale(2)');
  });

  it('writes a filter for blur', () => {
    const element = document.createElement('div');
    setState(element, { blur: 4 });
    expect(element.style.filter).toBe('blur(4px)');
  });
});
