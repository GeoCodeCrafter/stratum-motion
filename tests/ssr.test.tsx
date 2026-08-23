// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { Reveal } from '../src/components/Reveal';
import { Stagger } from '../src/components/Stagger';
import { Parallax } from '../src/components/Parallax';
import { ScrollScene } from '../src/components/ScrollScene';
import { PageTransition } from '../src/components/PageTransition';
import { MotionConfig } from '../src/context/MotionConfigContext';
import { isServer } from '../src/core/env';

/**
 * The contract this whole suite exists to protect: server output is the
 * finished page. If JavaScript never arrives - a failed chunk, a blocked
 * bundle, a crawler that does not execute scripts - the content is still
 * there, laid out exactly where it will end up.
 */
describe('server rendering', () => {
  it('knows it is on the server', () => {
    expect(isServer).toBe(true);
  });

  it('renders Reveal content with no hiding styles', () => {
    const html = renderToString(<Reveal>Visible on arrival</Reveal>);

    expect(html).toContain('Visible on arrival');
    expect(html).not.toContain('opacity:0');
    expect(html).not.toContain('transform');
    expect(html).not.toContain('visibility:hidden');
  });

  it('marks the reveal as idle rather than revealed', () => {
    expect(renderToString(<Reveal>Hello</Reveal>)).toContain('data-stratum-state="idle"');
  });

  it('renders every preset without hiding anything', () => {
    for (const preset of ['fade', 'fadeUp', 'rise', 'blurIn', 'tilt'] as const) {
      const html = renderToString(<Reveal preset={preset}>Content</Reveal>);
      expect(html).toContain('Content');
      expect(html).not.toContain('opacity:0');
      expect(html).not.toContain('filter:blur');
    }
  });

  it('renders a staggered list in full', () => {
    const html = renderToStaticMarkup(
      <Stagger as="ul" step={100}>
        <li>One</li>
        <li>Two</li>
        <li>Three</li>
      </Stagger>,
    );

    expect(html).toContain('One');
    expect(html).toContain('Two');
    expect(html).toContain('Three');
    expect(html).not.toContain('opacity:0');
  });

  it('renders a parallax layer untransformed', () => {
    const html = renderToStaticMarkup(<Parallax speed={0.5}>Layer</Parallax>);
    expect(html).toContain('Layer');
    expect(html).not.toContain('translate3d');
    expect(html).not.toContain('will-change');
  });

  it('gives a scroll scene a defined starting progress', () => {
    const html = renderToStaticMarkup(
      <ScrollScene>{({ progress }) => <span>progress: {progress}</span>}</ScrollScene>,
    );
    expect(html).toContain('progress: ');
    expect(html).toContain('0');
  });

  it('renders the current route inside a page transition', () => {
    const html = renderToStaticMarkup(<PageTransition transitionKey="/about">About us</PageTransition>);
    expect(html).toContain('About us');
  });

  it('honours a forced reduced-motion config without a media query available', () => {
    const html = renderToString(
      <MotionConfig reducedMotion="reduce">
        <Reveal>Hello</Reveal>
      </MotionConfig>,
    );
    expect(html).toContain('Hello');
  });

  it('never warns about useLayoutEffect on the server', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderToString(
      <Stagger>
        <Reveal>One</Reveal>
        <Parallax>Two</Parallax>
      </Stagger>,
    );

    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('does not reach for window, document or matchMedia while rendering', () => {
    expect(typeof window).toBe('undefined');
    expect(() =>
      renderToString(
        <MotionConfig>
          <Stagger>
            <Reveal>One</Reveal>
            <ScrollScene>{({ progress }) => <span>{progress}</span>}</ScrollScene>
          </Stagger>
        </MotionConfig>,
      ),
    ).not.toThrow();
  });
});
