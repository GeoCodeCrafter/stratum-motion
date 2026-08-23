import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { observeIntersection, observerPoolSize, resetObserverPool } from '../src/core/observer';
import { mockIntersectionObserver } from './helpers/intersection';

describe('the observer pool', () => {
  let io: ReturnType<typeof mockIntersectionObserver>;

  beforeEach(() => {
    resetObserverPool();
    io = mockIntersectionObserver();
  });

  afterEach(() => {
    resetObserverPool();
    io.restore();
  });

  it('shares one observer between elements with identical settings', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');

    observeIntersection(a, { amount: 0.5 }, vi.fn());
    observeIntersection(b, { amount: 0.5 }, vi.fn());

    expect(observerPoolSize()).toBe(1);
  });

  it('creates a separate observer per distinct configuration', () => {
    observeIntersection(document.createElement('div'), { amount: 0.5 }, vi.fn());
    observeIntersection(document.createElement('div'), { amount: 0.9 }, vi.fn());
    observeIntersection(document.createElement('div'), { amount: 0.9, rootMargin: '10px' }, vi.fn());

    expect(observerPoolSize()).toBe(3);
  });

  it('routes each entry to the callback that registered the element', () => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    const onA = vi.fn();
    const onB = vi.fn();

    observeIntersection(a, {}, onA);
    observeIntersection(b, {}, onB);
    io.enter();

    expect(onA).toHaveBeenCalledTimes(1);
    expect(onB).toHaveBeenCalledTimes(1);
    expect(onA.mock.calls[0]?.[0].target).toBe(a);
    expect(onB.mock.calls[0]?.[0].target).toBe(b);
  });

  it('disconnects the observer once its last element leaves', () => {
    const stopA = observeIntersection(document.createElement('div'), {}, vi.fn());
    const stopB = observeIntersection(document.createElement('div'), {}, vi.fn());

    stopA();
    expect(observerPoolSize()).toBe(1);
    stopB();
    expect(observerPoolSize()).toBe(0);
    expect(io.liveCount).toBe(0);
  });

  it('stops delivering entries after unsubscribing', () => {
    const element = document.createElement('div');
    const callback = vi.fn();
    const stop = observeIntersection(element, {}, callback);

    stop();
    io.enter();

    expect(callback).not.toHaveBeenCalled();
  });

  it('degrades to a no-op where IntersectionObserver is missing', () => {
    io.restore();
    const stop = observeIntersection(document.createElement('div'), {}, vi.fn());
    expect(typeof stop).toBe('function');
    expect(() => stop()).not.toThrow();
    expect(observerPoolSize()).toBe(0);
  });
});
