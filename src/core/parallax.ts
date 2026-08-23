import { round } from './math';

/**
 * Pixel offset for a parallax layer.
 *
 * `progress` is 0..1 across the element's scroll range, so 0.5 is the moment
 * it sits centred. Offsetting from that midpoint means the layer reads as
 * "in its right place" when the viewer is actually looking at it, instead of
 * drifting further out the longer the page is.
 */
export function parallaxOffset(progress: number, speed: number, travel: number): number {
  return round((0.5 - progress) * speed * travel);
}

/**
 * The distance a layer is allowed to move: the element's own height plus the
 * viewport, which is exactly the scroll distance it is on screen for.
 */
export function parallaxTravel(elementHeight: number, viewport: number): number {
  return elementHeight + viewport;
}

/**
 * Extra padding a parallax layer needs so its edges never expose a gap.
 * A layer moving 60px in each direction has to be 120px taller than its box.
 */
export function requiredOverscan(speed: number, travel: number): number {
  return Math.ceil(Math.abs(speed * travel));
}
