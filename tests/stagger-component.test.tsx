import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Stagger } from '../src/components/Stagger';
import { useStaggerDelay } from '../src/context/StaggerContext';
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

function DelayProbe({ label }: { label: string }) {
  return <span data-testid={label}>{useStaggerDelay()}</span>;
}

describe('Stagger', () => {
  it('hands each child an increasing delay', () => {
    render(
      <Stagger step={100}>
        <DelayProbe label="a" />
        <DelayProbe label="b" />
        <DelayProbe label="c" />
      </Stagger>,
    );

    expect(screen.getByTestId('a')).toHaveTextContent('0');
    expect(screen.getByTestId('b')).toHaveTextContent('100');
    expect(screen.getByTestId('c')).toHaveTextContent('200');
  });

  it('reverses the order when asked', () => {
    render(
      <Stagger step={100} from="last">
        <DelayProbe label="a" />
        <DelayProbe label="b" />
      </Stagger>,
    );

    expect(screen.getByTestId('a')).toHaveTextContent('100');
    expect(screen.getByTestId('b')).toHaveTextContent('0');
  });

  it('reaches a delay probe nested several levels deep', () => {
    render(
      <Stagger step={50}>
        <div>
          <section>
            <DelayProbe label="deep" />
          </section>
        </div>
        <DelayProbe label="second" />
      </Stagger>,
    );

    expect(screen.getByTestId('deep')).toHaveTextContent('0');
    expect(screen.getByTestId('second')).toHaveTextContent('50');
  });

  it('adds nested stagger delays to the outer one', () => {
    render(
      <Stagger step={100}>
        <div>first</div>
        <Stagger step={10}>
          <DelayProbe label="inner-a" />
          <DelayProbe label="inner-b" />
        </Stagger>
      </Stagger>,
    );

    expect(screen.getByTestId('inner-a')).toHaveTextContent('100');
    expect(screen.getByTestId('inner-b')).toHaveTextContent('110');
  });

  it('renders the requested element and marks it', () => {
    render(
      <Stagger as="ul" data-testid="list">
        <li>one</li>
      </Stagger>,
    );

    const list = screen.getByTestId('list');
    expect(list.tagName).toBe('UL');
    expect(list).toHaveAttribute('data-stratum', 'stagger');
  });

  it('survives having no children at all', () => {
    expect(() => render(<Stagger />)).not.toThrow();
  });
});
