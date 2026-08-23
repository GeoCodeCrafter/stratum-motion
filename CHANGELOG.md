# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[semantic versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] — 2026-08-23

First release.

### Added

- `Reveal`, `Stagger`, `Parallax`, `ScrollScene` and `PageTransition`
  components, each rendering its finished state on the server.
- `MotionConfig` provider with inheriting defaults, a duration scale, a motion
  preference override and a global `disabled` switch.
- `useReducedMotion`, `useSystemReducedMotion`, `useInView`,
  `useScrollProgress` and `useParallax` hooks.
- Ten entrance presets: `fade`, `fadeUp`, `fadeDown`, `fadeLeft`, `fadeRight`,
  `scaleIn`, `scaleOut`, `blurIn`, `rise`, `tilt`.
- A composited-property allowlist that throws `LayoutShiftError` — naming the
  transform-based alternative — when anything else is animated.
- A pooled IntersectionObserver registry and a single shared
  `requestAnimationFrame` loop.
- Web Animations API wrapper that falls back to snapping to the final state
  where WAAPI is unavailable.
- Prerendered, hydrated demo covering every primitive.
- End-to-end suite: reveal behaviour, reduced motion, route transitions, a
  JavaScript-disabled run, and a Cumulative Layout Shift budget of 0.01.

[Unreleased]: https://github.com/GeoCodeCrafter/stratum-motion/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/GeoCodeCrafter/stratum-motion/releases/tag/v0.1.0
