import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { Parallax } from '../src/components/Parallax';
import { mockMatchMedia } from './helpers/matchMedia';
import { stubRect, setViewportHeight } from './helpers/rect';
import { resetScheduler } from '../src/core/scheduler';

let media: ReturnType<typeof mockMatchMedia>;

beforeEach(() => {
  resetScheduler();
  media = mockMatchMedia(false);
  setViewportHeight(800);
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  resetScheduler();
  media.restore();
});

async function frame() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(32);
  });
}

describe('Parallax', () => {
  it('translates the layer by the expected offset', async () => {
    render(
      <Parallax speed={0.5} data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    stubRect(layer, { top: 100, height: 400 });

    await frame();

    // progress 0.583 across a 1200px travel at speed 0.5.
    expect(layer.style.transform).toBe('translate3d(0px, -50px, 0px)');
  });

  it('is still at the midpoint of its travel', async () => {
    render(
      <Parallax speed={0.4} data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    // top = 200 with height 400 puts the element exactly halfway.
    stubRect(layer, { top: 200, height: 400 });

    await frame();

    expect(layer.style.transform).toBe('translate3d(0px, 0px, 0px)');
  });

  it('moves the other way for a negative speed', async () => {
    render(
      <Parallax speed={-0.5} data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    stubRect(layer, { top: 100, height: 400 });

    await frame();

    expect(layer.style.transform).toBe('translate3d(0px, 50px, 0px)');
  });

  it('translates horizontally on the x axis', async () => {
    render(
      <Parallax speed={0.5} axis="x" data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    stubRect(layer, { top: 100, height: 400 });

    await frame();

    expect(layer.style.transform).toBe('translate3d(-50px, 0px, 0px)');
  });

  it('applies no transform at all under reduced motion', async () => {
    media = mockMatchMedia(true);
    render(
      <Parallax speed={0.5} data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    stubRect(layer, { top: 100, height: 400 });

    await frame();

    expect(layer.style.transform).toBe('');
    expect(layer.style.willChange).toBe('');
  });

  it('applies no transform when explicitly disabled', async () => {
    render(
      <Parallax speed={0.5} disabled data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    stubRect(layer, { top: 100, height: 400 });

    await frame();

    expect(layer.style.transform).toBe('');
  });

  it('hints the compositor while it is active and cleans up after', async () => {
    const view = render(
      <Parallax speed={0.5} data-testid="layer">
        content
      </Parallax>,
    );
    const layer = screen.getByTestId('layer');
    expect(layer.style.willChange).toBe('transform');

    view.unmount();

    expect(layer.style.willChange).toBe('');
  });

  it('leaves the frame loop empty once unmounted', async () => {
    const view = render(<Parallax speed={0.5}>content</Parallax>);
    view.unmount();
    const { frameSubscriberCount } = await import('../src/core/scheduler');
    expect(frameSubscriberCount()).toBe(0);
  });

  it('records its speed for debugging', () => {
    render(
      <Parallax speed={0.35} data-testid="layer">
        content
      </Parallax>,
    );
    expect(screen.getByTestId('layer')).toHaveAttribute('data-stratum-speed', '0.35');
  });
});
