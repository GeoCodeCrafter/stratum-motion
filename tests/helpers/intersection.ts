type Callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

interface Instance {
  callback: Callback;
  options: IntersectionObserverInit;
  elements: Set<Element>;
  disconnected: boolean;
}

/**
 * A controllable IntersectionObserver. Tests drive visibility explicitly with
 * `enter`/`leave` instead of trying to fake scroll positions in jsdom.
 */
export function mockIntersectionObserver() {
  const instances: Instance[] = [];

  class FakeObserver implements IntersectionObserver {
    readonly root: Element | Document | null;
    readonly rootMargin: string;
    readonly thresholds: ReadonlyArray<number>;
    private instance: Instance;

    constructor(callback: Callback, options: IntersectionObserverInit = {}) {
      this.root = (options.root as Element | Document | null) ?? null;
      this.rootMargin = options.rootMargin ?? '0px';
      this.thresholds = Array.isArray(options.threshold)
        ? options.threshold
        : [options.threshold ?? 0];
      this.instance = { callback, options, elements: new Set(), disconnected: false };
      instances.push(this.instance);
    }

    observe(element: Element): void {
      this.instance.elements.add(element);
    }

    unobserve(element: Element): void {
      this.instance.elements.delete(element);
    }

    disconnect(): void {
      this.instance.elements.clear();
      this.instance.disconnected = true;
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    value: FakeObserver,
    writable: true,
    configurable: true,
  });
  Object.defineProperty(globalThis, 'IntersectionObserver', {
    value: FakeObserver,
    writable: true,
    configurable: true,
  });

  const fire = (isIntersecting: boolean, ratio: number) => {
    for (const instance of instances) {
      if (instance.disconnected) continue;
      const entries = [...instance.elements].map(
        (target) =>
          ({
            target,
            isIntersecting,
            intersectionRatio: ratio,
            boundingClientRect: target.getBoundingClientRect(),
            intersectionRect: target.getBoundingClientRect(),
            rootBounds: null,
            time: 0,
          }) as unknown as IntersectionObserverEntry,
      );
      if (entries.length > 0) instance.callback(entries, {} as IntersectionObserver);
    }
  };

  return {
    instances,
    get liveCount() {
      return instances.filter((instance) => !instance.disconnected).length;
    },
    enter: () => fire(true, 1),
    leave: () => fire(false, 0),
    restore: () => {
      instances.length = 0;
      for (const target of [window, globalThis]) {
        Object.defineProperty(target, 'IntersectionObserver', {
          value: undefined,
          writable: true,
          configurable: true,
        });
      }
    },
  };
}
