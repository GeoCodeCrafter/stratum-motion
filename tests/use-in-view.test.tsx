import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { useInView } from '../src/hooks/useInView';
import { mockIntersectionObserver } from './helpers/intersection';
import { resetObserverPool } from '../src/core/observer';

let io: ReturnType<typeof mockIntersectionObserver>;

beforeEach(() => {
  resetObserverPool();
  io = mockIntersectionObserver();
});

afterEach(() => {
  resetObserverPool();
  io.restore();
});

function Probe({ once = true, skip = false }: { once?: boolean; skip?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, skip });
  return (
    <div ref={ref} data-testid="probe">
      {String(inView)}
    </div>
  );
}

describe('useInView', () => {
  it('starts out of view', () => {
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('false');
  });

  it('becomes true on intersection', () => {
    render(<Probe />);
    act(() => io.enter());
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it('latches once by default', () => {
    render(<Probe />);
    act(() => io.enter());
    act(() => io.leave());
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it('tracks both directions when once is false', () => {
    render(<Probe once={false} />);
    act(() => io.enter());
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
    act(() => io.leave());
    expect(screen.getByTestId('probe')).toHaveTextContent('false');
  });

  it('reports visible immediately when skipped', () => {
    render(<Probe skip />);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
    expect(io.liveCount).toBe(0);
  });

  it('fails open where IntersectionObserver does not exist', () => {
    io.restore();
    render(<Probe />);
    expect(screen.getByTestId('probe')).toHaveTextContent('true');
  });

  it('stops observing once unmounted', () => {
    const view = render(<Probe />);
    expect(io.liveCount).toBe(1);
    view.unmount();
    expect(io.liveCount).toBe(0);
  });
});
