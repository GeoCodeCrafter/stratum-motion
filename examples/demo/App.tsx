import { useState } from 'react';
import {
  MotionConfig,
  PageTransition,
  Parallax,
  Reveal,
  ScrollScene,
  Stagger,
  presetNames,
  useSystemReducedMotion,
} from '../../src/index';

const ROUTES = ['/', '/work', '/contact'] as const;

export function App() {
  const [forceReduce, setForceReduce] = useState(false);
  const [route, setRoute] = useState<(typeof ROUTES)[number]>('/');
  const systemReduced = useSystemReducedMotion();

  return (
    <MotionConfig reducedMotion={forceReduce ? 'reduce' : 'auto'}>
      <div className="toolbar">
        <strong>stratum-motion</strong>
        <button
          type="button"
          aria-pressed={forceReduce}
          data-testid="reduce-toggle"
          onClick={() => setForceReduce((value) => !value)}
        >
          Reduce motion
        </button>
        <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          system: {systemReduced ? 'reduce' : 'no-preference'}
        </span>
      </div>

      <main>
        <section>
          <Reveal as="h1" preset="rise" data-testid="hero">
            Motion that survives a failed bundle.
          </Reveal>
          <Reveal delay={120}>
            <p>
              Every element on this page is rendered in its final position on the server. Scroll
              down: nothing below moves anything above it.
            </p>
          </Reveal>
        </section>

        <section>
          <h2>Presets</h2>
          <p>All ten, staggered from the centre.</p>
          <Stagger as="ul" className="grid" step={60} from="center">
            {presetNames.map((name) => (
              <Reveal as="li" className="card" key={name} preset={name} data-testid={`preset-${name}`}>
                <code>{name}</code>
              </Reveal>
            ))}
          </Stagger>
        </section>

        <section>
          <h2>Parallax</h2>
          <p>The layer drifts; the box it sits in never moves.</p>
          <div className="band" data-testid="band">
            <Parallax className="band-layer" speed={0.35} data-testid="parallax-layer">
              stratum
            </Parallax>
          </div>
        </section>

        <section>
          <h2>Scroll scene</h2>
          <p>Raw progress, handed to whatever you like.</p>
          <ScrollScene data-testid="scene">
            {({ progress }) => (
              <div>
                <div
                  className="bar"
                  data-testid="scene-bar"
                  style={{ transform: `scaleX(${progress})`, transformOrigin: 'left' }}
                />
                <p data-testid="scene-value">{progress.toFixed(2)}</p>
              </div>
            )}
          </ScrollScene>
        </section>

        <section>
          <h2>Page transitions</h2>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {ROUTES.map((path) => (
              <button
                key={path}
                type="button"
                aria-pressed={route === path}
                data-testid={`route-${path === '/' ? 'home' : path.slice(1)}`}
                onClick={() => setRoute(path)}
              >
                {path}
              </button>
            ))}
          </div>
          <PageTransition transitionKey={route} className="card" data-testid="page">
            <h3 style={{ margin: 0 }}>{route}</h3>
            <p style={{ margin: '0.5rem 0 0' }}>Cross-faded on route change, short exit first.</p>
          </PageTransition>
        </section>

        <div className="spacer" />
      </main>
    </MotionConfig>
  );
}
