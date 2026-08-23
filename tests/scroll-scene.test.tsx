import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { ScrollScene } from '../src/components/ScrollScene';
import { mockMatchMedia } from './helpers/matchMedia';
import { stubRect, setViewportHeight } from './helpers/rect';
import { resetScheduler, frameSubscriberCount } from '../src/core/scheduler';

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

describe('ScrollScene', () => {
  it('hands progress to its render prop', async () => {
    render(
      <ScrollScene data-testid="scene">
        {({ progress }) => <span data-testid="value">{progress}</span>}
      </ScrollScene>,
    );
    stubRect(screen.getByTestId('scene'), { top: 200, height: 400 });

    await frame();

    expect(screen.getByTestId('value')).toHaveTextContent('0.5');
  });

  it('rounds to the requested precision so React re-renders sparingly', async () => {
    render(
      <ScrollScene precision={1} data-testid="scene">
        {({ progress }) => <span data-testid="value">{progress}</span>}
      </ScrollScene>,
    );
    stubRect(screen.getByTestId('scene'), { top: 100, height: 400 });

    await frame();

    expect(screen.getByTestId('value')).toHaveTextContent('0.6');
  });

  it('pins progress to the finished state under reduced motion', async () => {
    media.set(true);
    render(
      <ScrollScene data-testid="scene">
        {({ progress, reduced }) => (
          <span data-testid="value">
            {progress}:{String(reduced)}
          </span>
        )}
      </ScrollScene>,
    );
    stubRect(screen.getByTestId('scene'), { top: 700, height: 400 });

    await frame();

    expect(screen.getByTestId('value')).toHaveTextContent('1:true');
  });

  it('mirrors progress onto a data attribute', async () => {
    render(<ScrollScene data-testid="scene">{() => null}</ScrollScene>);
    stubRect(screen.getByTestId('scene'), { top: 200, height: 400 });

    await frame();

    expect(screen.getByTestId('scene')).toHaveAttribute('data-stratum-progress', '0.5');
  });

  it('unsubscribes from the frame loop on unmount', async () => {
    const view = render(<ScrollScene>{() => null}</ScrollScene>);
    await frame();
    view.unmount();
    expect(frameSubscriberCount()).toBe(0);
  });

  it('never subscribes at all under reduced motion', async () => {
    media.set(true);
    render(<ScrollScene>{() => null}</ScrollScene>);
    await frame();
    expect(frameSubscriberCount()).toBe(0);
  });
});
