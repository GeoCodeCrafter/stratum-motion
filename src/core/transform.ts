import { round } from './math';

export interface TransformParts {
  x?: number | string;
  y?: number | string;
  z?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  skewX?: number;
  skewY?: number;
}

function length(value: number | string): string {
  return typeof value === 'number' ? `${round(value)}px` : value;
}

/**
 * Build a transform string in a fixed order.
 *
 * Order matters - `translate` then `rotate` is not the same visual result as
 * `rotate` then `translate` - so it is fixed here rather than left to object
 * key order, which varies with how the caller happened to spell the object.
 */
export function buildTransform(parts: TransformParts): string {
  const out: string[] = [];

  const hasTranslate = parts.x !== undefined || parts.y !== undefined || parts.z !== undefined;
  if (hasTranslate) {
    const x = length(parts.x ?? 0);
    const y = length(parts.y ?? 0);
    const z = parts.z ?? 0;
    // translate3d keeps the element on its own compositor layer.
    out.push(`translate3d(${x}, ${y}, ${round(z)}px)`);
  }

  if (parts.rotate !== undefined) out.push(`rotate(${round(parts.rotate)}deg)`);
  if (parts.rotateX !== undefined) out.push(`rotateX(${round(parts.rotateX)}deg)`);
  if (parts.rotateY !== undefined) out.push(`rotateY(${round(parts.rotateY)}deg)`);
  if (parts.skewX !== undefined) out.push(`skewX(${round(parts.skewX)}deg)`);
  if (parts.skewY !== undefined) out.push(`skewY(${round(parts.skewY)}deg)`);

  if (parts.scale !== undefined) out.push(`scale(${round(parts.scale, 4)})`);
  if (parts.scaleX !== undefined) out.push(`scaleX(${round(parts.scaleX, 4)})`);
  if (parts.scaleY !== undefined) out.push(`scaleY(${round(parts.scaleY, 4)})`);

  return out.length > 0 ? out.join(' ') : 'none';
}

/** True when the parts describe the identity transform. */
export function isIdentity(parts: TransformParts): boolean {
  return buildTransform(parts) === 'none' || buildTransform(parts) === 'translate3d(0px, 0px, 0px)';
}
