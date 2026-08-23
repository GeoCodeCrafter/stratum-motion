import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';

// hydrateRoot, not createRoot: the markup is already in the HTML, produced by
// prerender.tsx at build time. That is what makes the no-JavaScript end-to-end
// test meaningful rather than decorative.
hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <App />
  </StrictMode>,
);
