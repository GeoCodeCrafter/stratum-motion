import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { onFrame, frameSubscriberCount, resetScheduler } from '../src/core/scheduler';

describe('the shared frame loop', () => {
  beforeEach(() => {
    resetScheduler();
    vi.useFakeTimers();
  });

  afterEach(() => {
    resetScheduler();
    vi.useRealTimers();
  });

  it('runs every subscriber on a frame', async () => {
    const a = vi.fn();
    const b = vi.fn();
    onFrame(a);
    onFrame(b);

    await vi.advanceTimersByTimeAsync(32);

    expect(a).toHaveBeenCalled();
    expect(b).toHaveBeenCalled();
  });

  it('keeps one loop for many subscribers', () => {
    const stopA = onFrame(vi.fn());
    const stopB = onFrame(vi.fn());
    expect(frameSubscriberCount()).toBe(2);
    stopA();
    stopB();
    expect(frameSubscriberCount()).toBe(0);
  });

  it('stops calling a subscriber once it unsubscribes', async () => {
    const callback = vi.fn();
    const stop = onFrame(callback);
    await vi.advanceTimersByTimeAsync(32);
    const callsBefore = callback.mock.calls.length;
    stop();
    await vi.advanceTimersByTimeAsync(64);
    expect(callback.mock.calls.length).toBe(callsBefore);
  });

  it('survives a subscriber unsubscribing itself mid-frame', async () => {
    const order: string[] = [];
    const stopSelf = onFrame(() => {
      order.push('first');
      stopSelf();
    });
    onFrame(() => order.push('second'));

    await vi.advanceTimersByTimeAsync(32);

    expect(order).toContain('first');
    expect(order).toContain('second');
    expect(frameSubscriberCount()).toBe(1);
  });
});
