import { chromium } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'dist');
const originalWorker = await readFile(join(root, 'sw.js'), 'utf8');
const originalVersion = originalWorker.match(/backup-receipt-([^']+)/)?.[1];
let workerVersion = 'verification-8-old';

const contentTypes = {
  '.css': 'text/css', '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.webp': 'image/webp'
};

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, 'http://127.0.0.1');
    let pathname = url.pathname;
    if (pathname === '/') pathname = '/index.html';
    if (pathname === '/demo' || pathname === '/demo/') pathname = '/demo.html';
    if (pathname.endsWith('/')) pathname += 'index.html';
    if (pathname === '/sw.js') {
      const body = originalWorker.replaceAll(originalVersion, workerVersion);
      response.writeHead(200, { 'content-type': 'text/javascript', 'cache-control': 'no-store' });
      response.end(body);
      return;
    }
    const clean = normalize(pathname).replace(/^\.\.(\/|\\)/, '');
    const file = join(root, clean);
    if (!(await stat(file)).isFile()) throw new Error('not a file');
    response.writeHead(200, { 'content-type': contentTypes[extname(file)] || 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
  }
});

await new Promise(resolve => server.listen(4198, '127.0.0.1', resolve));
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
await page.goto('http://127.0.0.1:4198/?demo=1', { waitUntil: 'networkidle' });
await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload({ waitUntil: 'networkidle' });
await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
const before = await page.evaluate(() => caches.keys());

workerVersion = 'verification-8-new';
await page.evaluate(async () => {
  const registration = await navigator.serviceWorker.getRegistration();
  await registration.update();
});
await page.locator('#toast-text').filter({ hasText: 'A fresh offline version is ready.' }).waitFor({ timeout: 15000 });
const result = await page.evaluate(async () => ({
  toast: document.querySelector('#toast-text')?.textContent,
  reloadVisible: !document.querySelector('#update-button')?.hasAttribute('hidden'),
  controlled: Boolean(navigator.serviceWorker.controller),
  caches: await caches.keys()
}));
result.before = before;
result.pass = before.some(name => name.includes('verification-8-old')) && result.caches.some(name => name.includes('verification-8-new')) && !result.caches.some(name => name.includes('verification-8-old')) && result.reloadVisible && result.controlled;
await writeFile('.factory/qa-artifacts/service-worker-update-8.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
await new Promise(resolve => server.close(resolve));
process.exitCode = result.pass ? 0 : 1;
