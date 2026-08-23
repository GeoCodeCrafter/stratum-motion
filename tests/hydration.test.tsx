import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ReactElement } from 'react';
import { act } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { Reveal } from '../src/components/Reveal';
import { Stagger } from '../src/components/Stagger';
import { mockIntersectionObserver } from './helpers/intersection';
import { mockMatchMedia } from './helpers/matchMedia';
import { resetObserverPool } from '../src/core/observer';

let io: ReturnType<typeof mockIntersectionObserver>;
let media: ReturnType<typeof mockMatchMedia>;

beforeEach(() => {
  resetObserverPool();
  io = mockIntersectionObserver();
  media = mockMatchMedia(false);
});

afterEach(() => {
  resetObserverPool();
  io.restore();
  media.restore();
});

/**
 * Rendering to a string inside jsdom makes React think a client component is
 * server rendering, because `window` exists. That produces a useLayoutEffect
 * warning no real server ever sees - `tests/ssr.test.tsx` runs in the node
 * environment and asserts the warning is absent there. Everything else,
 * hydration mismatches especially, is still caught here.
 */
const JSDOM_ONLY = 'useLayoutEffect does nothing on the server';

function hydrate(element: ReactElement) {
  const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
  const container = document.createElement('div');
  container.innerHTML = renderToString(element);
  document.body.appendChild(container);

  act(() => {
    hydrateRoot(container, element);
  });

  const warnings = () =>
    errors.mock.calls.map((call) => String(call[0])).filter((message) => !message.includes(JSDOM_ONLY));

  return { container, warnings, restore: () => errors.mockRestore() };
}

describe('hydration', () => {
  it('hydrates a reveal without a single mismatch warning', () => {
    const { warnings, restore } = hydrate(<Reveal>Hello</Reveal>);

    expect(warnings()).toEqual([]);
    restore();
  });

  it('hydrates a staggered list without warnings', () => {
    const { warnings, restore } = hydrate(
      <Stagger as="ul" step={80}>
        <li>One</li>
        <li>Two</li>
      </Stagger>,
    );

    expect(warnings()).toEqual([]);
    restore();
  });

  it('applies the hidden state only after hydration, never in the markup', () => {
    const { container, restore } = hydrate(<Reveal>Hello</Reveal>);
    const element = container.firstElementChild as HTMLElement;

    expect(container.innerHTML).toContain('Hello');
    expect(element.style.opacity).toBe('0');
    restore();
  });

  it('reveals normally once hydrated', async () => {
    const { container, warnings, restore } = hydrate(<Reveal>Hello</Reveal>);
    const element = container.firstElementChild as HTMLElement;

    await act(async () => {
      io.enter();
    });

    expect(element.style.opacity).toBe('1');
    expect(element).toHaveAttribute('data-stratum-state', 'revealed');
    expect(warnings()).toEqual([]);
    restore();
  });
});
