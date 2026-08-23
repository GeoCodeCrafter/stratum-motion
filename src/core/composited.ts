/**
 * Properties the compositor can animate without touching layout or paint.
 * Everything this library animates has to come from this list - that is the
 * whole mechanism behind the "no layout shift by construction" claim.
 */
export const COMPOSITED_PROPERTIES = ['opacity', 'transform', 'filter'] as const;

export type CompositedProperty = (typeof COMPOSITED_PROPERTIES)[number];

/**
 * Properties people reach for by instinct, each of which forces layout and
 * shows up as cumulative layout shift. Named individually so the error can
 * suggest the fix instead of just refusing.
 */
const LAYOUT_ALTERNATIVES: Record<string, string> = {
  height: 'animate transform: scaleY() instead, or wrap in a grid-template-rows trick',
  width: 'animate transform: scaleX() instead',
  top: 'animate transform: translateY() instead',
  left: 'animate transform: translateX() instead',
  right: 'animate transform: translateX() instead',
  bottom: 'animate transform: translateY() instead',
  margin: 'animate transform: translate() instead',
  marginTop: 'animate transform: translateY() instead',
  marginLeft: 'animate transform: translateX() instead',
  padding: 'animate transform: scale() on a child instead',
  fontSize: 'animate transform: scale() instead',
  display: 'cross-fade with opacity instead of toggling display',
};

export function isCompositedProperty(property: string): property is CompositedProperty {
  return (COMPOSITED_PROPERTIES as readonly string[]).includes(property);
}

export class LayoutShiftError extends Error {
  readonly property: string;

  constructor(property: string) {
    const hint = LAYOUT_ALTERNATIVES[property];
    super(
      `stratum-motion refuses to animate "${property}" because it forces layout` +
        (hint ? ` - ${hint}.` : '. Use opacity, transform or filter.'),
    );
    this.name = 'LayoutShiftError';
    this.property = property;
  }
}

/**
 * Gate every keyframe through this. Presets, the `Reveal` component and the
 * public `animate` helper all call it, so an accidental `height` animation
 * fails loudly in development rather than quietly costing Core Web Vitals.
 */
export function assertCompositedOnly(keyframe: Record<string, unknown>): void {
  for (const property of Object.keys(keyframe)) {
    if (!isCompositedProperty(property)) throw new LayoutShiftError(property);
  }
}
