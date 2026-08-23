export type StaggerFrom = 'first' | 'last' | 'center' | 'edges';

/**
 * Delays, in milliseconds, for `count` siblings.
 *
 * Returned as an array rather than computed per child so the ordering rule
 * lives in one pure function that a test can pin down exactly.
 */
export function staggerDelays(count: number, step: number, from: StaggerFrom = 'first'): number[] {
  if (count <= 0) return [];
  if (count === 1) return [0];

  const indices = Array.from({ length: count }, (_, index) => index);
  const last = count - 1;
  const centre = last / 2;

  const distance = (index: number): number => {
    switch (from) {
      case 'first':
        return index;
      case 'last':
        return last - index;
      case 'center':
        return Math.abs(index - centre);
      case 'edges':
        return centre - Math.abs(index - centre);
      default:
        return index;
    }
  };

  const distances = indices.map(distance);
  // Normalise so someone always starts at zero. An even-numbered `center`
  // group would otherwise open with half a step of dead time before anything
  // moves, which reads as lag rather than as choreography.
  const earliest = Math.min(...distances);
  return distances.map((value) => Math.round((value - earliest) * step));
}

/** Total time from the first child starting to the last one starting. */
export function staggerDuration(count: number, step: number, from: StaggerFrom = 'first'): number {
  const delays = staggerDelays(count, step, from);
  return delays.length === 0 ? 0 : Math.max(...delays);
}
