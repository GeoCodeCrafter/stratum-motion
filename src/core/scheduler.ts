import { canUseDOM } from './env';

export type FrameCallback = (timestamp: number) => void;

const callbacks = new Set<FrameCallback>();
let frameHandle: number | null = null;

function tick(timestamp: number): void {
  frameHandle = null;
  // Copy first: a callback may unsubscribe itself or a sibling mid-frame.
  for (const callback of [...callbacks]) {
    if (callbacks.has(callback)) callback(timestamp);
  }
  if (callbacks.size > 0) schedule();
}

function schedule(): void {
  if (frameHandle !== null || !canUseDOM) return;
  frameHandle = requestAnimationFrame(tick);
}

/**
 * One rAF loop for the whole page rather than one per animated element.
 * Twenty parallax layers should cost one callback per frame, not twenty.
 */
export function onFrame(callback: FrameCallback): () => void {
  callbacks.add(callback);
  schedule();
  return () => {
    callbacks.delete(callback);
    if (callbacks.size === 0 && frameHandle !== null && canUseDOM) {
      cancelAnimationFrame(frameHandle);
      frameHandle = null;
    }
  };
}

/** Number of live frame subscribers. Exposed for tests and debugging. */
export function frameSubscriberCount(): number {
  return callbacks.size;
}

/** Drop every subscriber. Used by tests to guarantee isolation. */
export function resetScheduler(): void {
  callbacks.clear();
  if (frameHandle !== null && canUseDOM) cancelAnimationFrame(frameHandle);
  frameHandle = null;
}
