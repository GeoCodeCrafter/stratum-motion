import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PageTransition } from '../src/components/PageTransition';
import { MotionConfig } from '../src/context/MotionConfigContext';
import { mockMatchMedia } from './helpers/matchMedia';

let media: ReturnType<typeof mockMatchMedia>;

beforeEach(() => {
  media = mockMatchMedia(false);
});

afterEach(() => {
  media.restore();
});

describe('PageTransition', () => {
  it('renders the current route', () => {
    render(<PageTransition transitionKey="/">Home</PageTransition>);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('swaps content when the key changes', async () => {
    const view = render(<PageTransition transitionKey="/">Home</PageTransition>);

    view.rerender(<PageTransition transitionKey="/about">About</PageTransition>);

    await waitFor(() => expect(screen.getByText('About')).toBeInTheDocument());
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
  });

  it('records the key it is currently showing', async () => {
    const view = render(
      <PageTransition transitionKey="/" data-testid="shell">
        Home
      </PageTransition>,
    );
    expect(screen.getByTestId('shell')).toHaveAttribute('data-stratum-key', '/');

    view.rerender(
      <PageTransition transitionKey="/about" data-testid="shell">
        About
      </PageTransition>,
    );

    await waitFor(() => expect(screen.getByTestId('shell')).toHaveAttribute('data-stratum-key', '/about'));
  });

  it('updates children in place when the key has not changed', () => {
    const view = render(<PageTransition transitionKey="/">First</PageTransition>);

    view.rerender(<PageTransition transitionKey="/">Second</PageTransition>);

    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('ends fully opaque so a route never lands half-faded', async () => {
    const view = render(
      <PageTransition transitionKey="/" data-testid="shell">
        Home
      </PageTransition>,
    );

    view.rerender(
      <PageTransition transitionKey="/about" data-testid="shell">
        About
      </PageTransition>,
    );

    await waitFor(() => expect(screen.getByTestId('shell').style.opacity).toBe('1'));
  });

  it('swaps instantly when motion is disabled', () => {
    const view = render(
      <MotionConfig disabled>
        <PageTransition transitionKey="/">Home</PageTransition>
      </MotionConfig>,
    );

    view.rerender(
      <MotionConfig disabled>
        <PageTransition transitionKey="/about">About</PageTransition>
      </MotionConfig>,
    );

    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('still swaps under reduced motion', async () => {
    media.set(true);
    const view = render(<PageTransition transitionKey="/">Home</PageTransition>);

    view.rerender(<PageTransition transitionKey="/about">About</PageTransition>);

    await waitFor(() => expect(screen.getByText('About')).toBeInTheDocument());
  });

  it('survives a key changing twice before the first transition lands', async () => {
    const view = render(<PageTransition transitionKey="/">Home</PageTransition>);

    view.rerender(<PageTransition transitionKey="/about">About</PageTransition>);
    view.rerender(<PageTransition transitionKey="/contact">Contact</PageTransition>);

    await waitFor(() => expect(screen.getByText('Contact')).toBeInTheDocument());
    expect(screen.queryByText('About')).not.toBeInTheDocument();
  });
});
