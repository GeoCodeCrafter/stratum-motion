import { defineConfig } from 'tsup';

/**
 * The demo is bundled with React inlined so it can be served as plain static
 * files - no framework, no CDN, nothing for the end-to-end tests to wait on
 * except the page itself.
 */
export default defineConfig({
  entry: { demo: 'examples/demo/main.tsx' },
  outDir: 'examples/demo/dist',
  format: ['esm'],
  platform: 'browser',
  target: 'es2020',
  clean: true,
  dts: false,
  sourcemap: false,
  noExternal: [/.*/],
  define: { 'process.env.NODE_ENV': '"production"' },
});
