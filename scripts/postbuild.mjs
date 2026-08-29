import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const assetDirectory = join('dist', 'assets');
const assets = await readdir(assetDirectory);
const app = assets.find((file) => /^app-[a-zA-Z0-9_-]+\.js$/.test(file));
const style = assets.find((file) => /^style-[a-zA-Z0-9_-]+\.css$/.test(file));

if (!app || !style) throw new Error('Expected hashed app JavaScript and stylesheet in dist/assets.');

const buildId = app.match(/^app-([a-zA-Z0-9_-]+)\.js$/)?.[1];
if (!buildId) throw new Error('Could not read the app build fingerprint.');
const serviceWorkerPath = join('dist', 'sw.js');
const source = await readFile(serviceWorkerPath, 'utf8');
const output = source
  .replaceAll('__BUILD_ID__', buildId)
  .replaceAll('__APP_JS__', app)
  .replaceAll('__STYLE_CSS__', style);

if (output.includes('__')) throw new Error('Service-worker build placeholders were not resolved.');
await writeFile(serviceWorkerPath, output);

for (const relativePath of ['index.html', 'privacy/index.html', 'terms/index.html', '404.html', 'offline.html']) {
  const path = join('dist', relativePath);
  const html = await readFile(path, 'utf8');
  await writeFile(path, html.replaceAll('__BUILD_ID__', buildId));
}

// /demo is a server rewrite in production. Keep a distinct cached document so
// an offline /demo navigation retains its demo identity instead of becoming /.
await writeFile(join('dist', 'demo.html'), await readFile(join('dist', 'index.html')));
