/** Give an element a fixed bounding rect, since jsdom measures everything as zero. */
export function stubRect(element: Element, rect: Partial<DOMRect>): void {
  const full: DOMRect = {
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    toJSON: () => ({}),
    ...rect,
  } as DOMRect;

  element.getBoundingClientRect = () => full;
}

/** Set the jsdom viewport height. */
export function setViewportHeight(height: number): void {
  Object.defineProperty(window, 'innerHeight', { value: height, writable: true, configurable: true });
}
