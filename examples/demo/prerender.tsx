import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { App } from './App';

/**
 * Render the demo to static HTML at build time.
 *
 * The point is not speed. It is that the page you get with JavaScript blocked
 * is the same page you get with it enabled, minus the transitions - which is
 * exactly the claim the library makes and the end-to-end suite checks.
 */
const here = dirname(fileURLToPath(import.meta.url));
const demoRoot = join(here, '..');

const template = readFileSync(join(demoRoot, 'template.html'), 'utf8');
const html = renderToString(
  <StrictMode>
    <App />
  </StrictMode>,
);

writeFileSync(join(demoRoot, 'index.html'), template.replace('<!--app-->', html), 'utf8');
console.log('prerendered examples/demo/index.html');
