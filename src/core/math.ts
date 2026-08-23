/** Constrain `value` to the inclusive range [`min`, `max`]. */
export function clamp(value: number, min = 0, max = 1): number {
  if (min > max) throw new RangeError(`clamp: min (${min}) is greater than max (${max})`);
  const constrained = value < min ? min : value > max ? max : value;
  // `+ 0` collapses -0 to 0. Both compare equal, but -0 leaks into snapshot
  // and Object.is comparisons as a phantom difference.
  return constrained + 0;
}

/** Linear interpolation between `a` and `b` at position `t`. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Normalise `value` into 0..1 across the range [`start`, `end`].
 * A zero-width range collapses to 1 rather than dividing by zero.
 */
export function progress(value: number, start: number, end: number): number {
  if (start === end) return 1;
  return clamp((value - start) / (end - start));
}

/** Remap `value` from one range onto another, clamping the input first. */
export function mapRange(
  value: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number,
): number {
  return lerp(outStart, outEnd, progress(value, inStart, inEnd));
}

/** Round to a fixed number of decimals, avoiding 0.30000000000000004 in styles. */
export function round(value: number, decimals = 3): number {
  const factor = 10 ** decimals;
  // `+ 0` for the same reason as clamp: -0 has no place in a style string.
  return Math.round(value * factor) / factor + 0;
}

/** Distance in pixels, used by the parallax offset maths. */
export function pxDelta(progressValue: number, distance: number): number {
  return round(lerp(-distance, distance, progressValue));
}
