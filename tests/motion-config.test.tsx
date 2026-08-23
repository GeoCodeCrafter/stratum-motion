import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { MotionConfig, useMotionConfig, defaultMotionConfig } from '../src/context/MotionConfigContext';
import { useReducedMotion, useSystemReducedMotion } from '../src/hooks/useReducedMotion';
import { mockMatchMedia } from './helpers/matchMedia';

let media: ReturnType<typeof mockMatchMedia>;

beforeEach(() => {
  media = mockMatchMedia(false);
});

afterEach(() => {
  media.restore();
});

function ConfigProbe() {
  const config = useMotionConfig();
  return <span data-testid="config">{JSON.stringify(config)}</span>;
}

function PreferenceProbe() {
  return (
    <span data-testid="preference">
      {String(useReducedMotion())}:{String(useSystemReducedMotion())}
    </span>
  );
}

describe('MotionConfig', () => {
  it('supplies sensible defaults with no provider at all', () => {
    render(<ConfigProbe />);
    expect(JSON.parse(screen.getByTestId('config').textContent!)).toEqual(defaultMotionConfig);
  });

  it('overrides only what it is given', () => {
    render(
      <MotionConfig durationScale={2}>
        <ConfigProbe />
      </MotionConfig>,
    );
    const config = JSON.parse(screen.getByTestId('config').textContent!);
    expect(config.durationScale).toBe(2);
    expect(config.defaultDuration).toBe(defaultMotionConfig.defaultDuration);
  });

  it('inherits through nesting instead of resetting', () => {
    render(
      <MotionConfig durationScale={2} defaultEasing="linear">
        <MotionConfig durationScale={3}>
          <ConfigProbe />
        </MotionConfig>
      </MotionConfig>,
    );
    const config = JSON.parse(screen.getByTestId('config').textContent!);
    expect(config.durationScale).toBe(3);
    expect(config.defaultEasing).toBe('linear');
  });
});

describe('useReducedMotion', () => {
  it('follows the system preference by default', () => {
    media.set(true);
    render(<PreferenceProbe />);
    expect(screen.getByTestId('preference')).toHaveTextContent('true:true');
  });

  it('can force reduction on a system that has not asked for it', () => {
    render(
      <MotionConfig reducedMotion="reduce">
        <PreferenceProbe />
      </MotionConfig>,
    );
    expect(screen.getByTestId('preference')).toHaveTextContent('true:false');
  });

  it('can override the system preference the other way for an in-app toggle', () => {
    media.set(true);
    render(
      <MotionConfig reducedMotion="no-preference">
        <PreferenceProbe />
      </MotionConfig>,
    );
    expect(screen.getByTestId('preference')).toHaveTextContent('false:true');
  });

  it('treats disabled as reduced, whatever else is configured', () => {
    render(
      <MotionConfig disabled reducedMotion="no-preference">
        <PreferenceProbe />
      </MotionConfig>,
    );
    expect(screen.getByTestId('preference')).toHaveTextContent('true:false');
  });

  it('reacts to the preference changing while mounted', () => {
    render(<PreferenceProbe />);
    expect(screen.getByTestId('preference')).toHaveTextContent('false:false');

    act(() => media.set(true));

    expect(screen.getByTestId('preference')).toHaveTextContent('true:true');
  });
});
