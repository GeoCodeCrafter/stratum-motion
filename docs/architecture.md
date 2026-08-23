# Architecture

Three layers, each one testable without the one above it.

```
components/   Reveal, Stagger, Parallax, ScrollScene, PageTransition
     ↓
hooks/        useInView, useScrollProgress, useParallax, useReducedMotion
     ↓
core/         pure maths, shared browser resources, the property guard
```

Most of the interesting logic lives in `core/` as pure functions over plain
numbers and rects. `scrollProgress` takes a rect and a viewport height rather
than reading the DOM; `staggerDelays` takes a count and a step; `parallaxOffset`
takes a progress value. That is why the suite can pin exact values — a parallax
layer at a known rect produces exactly `-50px`, not "something plausible".

## The three mechanisms worth knowing

### Server-visible resting state

`Reveal` renders no inline styles at all. On mount, a layout effect applies the
hidden state to the node directly — not through React state, which would need a
render pass and could paint first.

```
server render        → final layout, fully visible, data-stratum-state="idle"
client layout effect → hidden state written to node.style, before paint
element enters view  → WAAPI animation from hidden to final
```

The ordering is the whole trick. Hidden only ever exists while JavaScript is
running to remove it, which means a failed bundle degrades to a static page
rather than a blank one.

### The composited allowlist

`assertCompositedOnly` runs on every keyframe the library builds, including
user-supplied literal transitions. It is a runtime check rather than a type
constraint on purpose: `MotionState` is a structural type, and a cast or a
value from an API can carry a `height` past the compiler. The error names the
transform-based alternative for the twelve properties people reach for by
instinct.

### Shared browser resources

Two module-level registries, both with reset functions the tests use:

- `core/observer.ts` keys IntersectionObservers by `(root, amount, rootMargin)`
  and reference-counts them. Fifty reveals with the same threshold share one.
- `core/scheduler.ts` keeps one `requestAnimationFrame` loop and a set of
  callbacks. It stops entirely when the last subscriber leaves, so an idle page
  schedules no frames at all.

Both matter more than they look: a page of thirty parallax layers with an
observer and a rAF loop each is a measurably worse page.

## Where React is deliberately not involved

`useParallax` writes `element.style.transform` directly inside the frame loop.
Routing that through state would re-render a subtree sixty times a second to
produce a value only the compositor consumes. `useScrollProgress` does use
state — its consumers need to render — but rounds to a configurable precision
first, so a slow scroll produces far fewer renders than it does frames.

## Testing strategy

| Layer | Environment | What it proves |
| --- | --- | --- |
| `core/` | none needed | Exact numeric behaviour, boundaries, error cases |
| `hooks/`, `components/` | jsdom | Wiring, cleanup, reduced-motion branches |
| SSR | node, no `window` | No DOM access and no hidden markup during render |
| Hydration | jsdom | Server markup and client render agree |
| End-to-end | Chromium | Real IntersectionObserver, real WAAPI, real CLS, JS disabled |

The layers are deliberately redundant at the boundaries. The unit suite asserts
a parallax layer gets a transform; the end-to-end suite asserts it actually
moves on a real scroll. Neither one alone would catch both a maths error and a
browser-behaviour error.
