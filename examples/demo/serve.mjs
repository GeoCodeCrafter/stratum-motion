import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('.', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const port = Number(process.env.PORT ?? 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
};

createServer(async (request, response) => {
  const requested = decodeURIComponent((request.url ?? '/').split('?')[0]);
  const relative = normalize(requested === '/' ? 'index.html' : requested.replace(/^\/+/, ''));

  // Refuse to serve anything above the demo directory.
  if (relative.startsWith('..')) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  try {
    const body = await readFile(join(root, relative));
    response.writeHead(200, { 'content-type': TYPES[extname(relative)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404).end('Not found');
  }
}).listen(port, () => {
  console.log(`demo running at http://localhost:${port}`);
});
