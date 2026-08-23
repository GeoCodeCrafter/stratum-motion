import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  // The SSR suite runs in the node environment, where there is nothing to
  // clean up and touching the DOM would throw.
  if (typeof document !== 'undefined') cleanup();
  vi.restoreAllMocks();
});
