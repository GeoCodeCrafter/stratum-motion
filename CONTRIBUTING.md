# Contributing

## Getting set up

```bash
npm install
```

```bash
npm test
```

```bash
npm run demo
```

The demo builds and serves on <http://localhost:4319>. It is prerendered and
then hydrated, deliberately — it is the fixture the end-to-end suite runs
against, so it has to behave like a real app rather than a playground.

## The rules that are not negotiable

These are the reasons the library exists. A change that breaks one of them is a
different library, not an improvement.

1. **Server output is the finished page.** No primitive may render a hidden
   state on the server. If JavaScript never arrives, the content is all there,
   laid out where it belongs.
2. **Only `opacity`, `transform` and `filter` are ever animated.** Anything else
   forces layout. `assertCompositedOnly` enforces this at runtime and there is
   no escape hatch.
3. **`prefers-reduced-motion: reduce` removes movement, never content.** A
   reduced-motion user sees everything, just without the travel.
4. **No runtime dependencies.** React is a peer; that is the whole list.

Each of these has tests behind it. If you find yourself editing those tests to
make a change pass, stop and reconsider the change.

## Tests

- `tests/*.test.ts` — pure logic, no DOM needed.
- `tests/*.test.tsx` — components in jsdom.
- `tests/ssr.test.tsx` — runs in the node environment, so `window` genuinely
  does not exist.
- `tests/hydration.test.tsx` — server markup hydrated in jsdom, asserting React
  reports no mismatch.
- `e2e/*.spec.ts` — Playwright against the demo, including a JavaScript-disabled
  run and a CLS budget.

Coverage thresholds are enforced in CI: 85% lines, functions and statements,
80% branches. They are a floor, not a target — a well-covered module with a
weak assertion is worse than an uncovered one, because it looks finished.

```bash
npm run test:coverage
```

```bash
npx playwright install chromium
npm run test:e2e
```

## Adding a preset

1. Add the factory to `src/presets/index.ts`.
2. Add its name to `PresetName`.
3. Add it to the expected list in `tests/presets.test.ts`.

The shared assertions — starts invisible, ends at rest, composited properties
only, reduces to a plain fade — then apply to it automatically.

## Commits

Conventional commits: `feat`, `fix`, `test`, `docs`, `chore`, `ci`, with an
optional scope (`feat(core):`). Small commits are preferred; a commit that
changes behaviour and its tests together is ideal.

## Releasing

1. Update `CHANGELOG.md`.
2. Bump the version in `package.json`.
3. Tag `vX.Y.Z` and push. CI must be green before the tag.
