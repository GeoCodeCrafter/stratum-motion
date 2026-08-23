import { defineConfig } from 'tsup';

/**
 * Two bundles, one source.
 *
 * `demo` is the browser bundle with React inlined, so the demo can be served
 * as plain static files. `prerender` runs in node at build time and writes
 * index.html from the template. Same components either side.
 */
export default defineConfig([
  {
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
  },
  {
    entry: { prerender: 'examples/demo/prerender.tsx' },
    outDir: 'examples/demo/dist',
    format: ['esm'],
    platform: 'node',
    target: 'node18',
    clean: false,
    dts: false,
    sourcemap: false,
    // React stays external here: bundling react-dom/server into ESM turns its
    // require('stream') into a dynamic require node refuses to run.
    external: ['react', 'react-dom', 'react-dom/server'],
    define: { 'process.env.NODE_ENV': '"production"' },
  },
]);
