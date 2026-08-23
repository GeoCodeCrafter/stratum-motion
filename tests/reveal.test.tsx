import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { Reveal } from '../src/components/Reveal';
import { MotionConfig } from '../src/context/MotionConfigContext';
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

describe('Reveal', () => {
  it('renders its children', () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('forwards arbitrary props to the rendered element', () => {
    render(
      <Reveal id="intro" aria-label="Introduction" className="card">
        Hello
      </Reveal>,
    );
    const element = screen.getByLabelText('Introduction');
    expect(element).toHaveAttribute('id', 'intro');
    expect(element).toHaveClass('card');
  });

  it('renders the element type it is asked for', () => {
    render(<Reveal as="section">Hello</Reveal>);
    expect(screen.getByText('Hello').tagName).toBe('SECTION');
  });

  it('applies the hidden state on mount, before anything is in view', () => {
    render(<Reveal>Hello</Reveal>);
    const element = screen.getByText('Hello');
    expect(element.style.opacity).toBe('0');
    expect(element).toHaveAttribute('data-stratum-state', 'idle');
  });

  it('animates to visible once the element enters the viewport', async () => {
    render(<Reveal>Hello</Reveal>);
    const element = screen.getByText('Hello');

    act(() => io.enter());

    expect(element.style.opacity).toBe('1');
    expect(element.style.transform).toBe('translate3d(0px, 0px, 0px)');
    await waitFor(() => expect(element).toHaveAttribute('data-stratum-state', 'revealed'));
  });

  it('calls onReveal exactly once', async () => {
    const onReveal = vi.fn();
    render(<Reveal onReveal={onReveal}>Hello</Reveal>);

    act(() => io.enter());

    await waitFor(() => expect(onReveal).toHaveBeenCalledTimes(1));
  });

  it('stays revealed after leaving the viewport when once is set', async () => {
    render(<Reveal once>Hello</Reveal>);
    const element = screen.getByText('Hello');

    act(() => io.enter());
    await waitFor(() => expect(element).toHaveAttribute('data-stratum-state', 'revealed'));
    act(() => io.leave());

    expect(element.style.opacity).toBe('1');
  });

  it('hides again on leaving when once is false', async () => {
    render(
      <Reveal once={false} preset="fade">
        Hello
      </Reveal>,
    );
    const element = screen.getByText('Hello');

    act(() => io.enter());
    await waitFor(() => expect(element.style.opacity).toBe('1'));
    act(() => io.leave());

    await waitFor(() => expect(element.style.opacity).toBe('0'));
  });

  it('never applies a transform under reduced motion', async () => {
    media.set(true);
    render(<Reveal preset="rise">Hello</Reveal>);
    const element = screen.getByText('Hello');

    expect(element.style.transform).toBe('');
    act(() => io.enter());

    await waitFor(() => expect(element).toHaveAttribute('data-stratum-state', 'revealed'));
    expect(element.style.opacity).toBe('1');
    expect(element.style.transform).toBe('');
  });

  it('does not hide anything when motion is disabled outright', () => {
    render(
      <MotionConfig disabled>
        <Reveal>Hello</Reveal>
      </MotionConfig>,
    );
    const element = screen.getByText('Hello');

    expect(element.style.opacity).toBe('1');
  });

  it('uses one pooled observer for many reveals', () => {
    render(
      <>
        <Reveal>One</Reveal>
        <Reveal>Two</Reveal>
        <Reveal>Three</Reveal>
      </>,
    );
    expect(io.liveCount).toBe(1);
  });

  it('marks itself with a data attribute for styling and end-to-end tests', () => {
    render(<Reveal>Hello</Reveal>);
    expect(screen.getByText('Hello')).toHaveAttribute('data-stratum', 'reveal');
  });
});
