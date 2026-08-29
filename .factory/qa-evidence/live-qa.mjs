import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const origin = 'https://android-backup-receipt.sociobot.in';
const report = {};

function observe(page, bucket) {
  page.on('console', (message) => {
    if (message.type() === 'error') bucket.push(`console: ${message.text()}`);
  });
  page.on('pageerror', (error) => bucket.push(`pageerror: ${error.message}`));
  page.on('requestfailed', (request) => bucket.push(`requestfailed: ${request.url()} ${request.failure()?.errorText || ''}`));
}

async function chooseVirtualFolder(page, selector, folder, files) {
  await page.locator(selector).evaluate((input, payload) => {
    const transfer = new DataTransfer();
    for (const entry of payload.files) {
      const file = new File([entry.body], entry.path.split('/').pop() || 'file', { lastModified: 1 });
      Object.defineProperty(file, 'webkitRelativePath', { value: `${payload.folder}/${entry.path}` });
      transfer.items.add(file);
    }
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { folder, files });
}

const browser = await chromium.launch({ headless: true });

{
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  observe(page, errors);
  page.on('request', (request) => requests.push(request.url()));
  const response = await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  const semantics = await page.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    imagesMissingAlt: [...document.images].filter((image) => !image.hasAttribute('alt')).length,
    primary: document.querySelector('.hero-actions .button-primary')?.textContent?.trim(),
    headline: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
    audience: document.querySelector('.lede')?.textContent?.trim(),
  }));
  const axe = await new AxeBuilder({ page }).analyze();
  report.desktopCold = {
    status: response?.status(), semantics, errors,
    externalRequests: requests.filter((url) => new URL(url).origin !== origin),
    axe: axe.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
  };
  await page.screenshot({ path: '.factory/qa-evidence/live-desktop-full.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  observe(page, errors);
  await page.goto(`${origin}/demo`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  const layout = await page.evaluate(() => ({
    bodyWidth: document.body.scrollWidth,
    viewportWidth: innerWidth,
    h1Count: document.querySelectorAll('h1').length,
    demoBanner: !document.querySelector('#demo-banner')?.hasAttribute('hidden'),
    receiptVisible: !document.querySelector('#receipt')?.hasAttribute('hidden'),
    touchTargetsBelow44: [...document.querySelectorAll('a,button,input,label')].filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    }).map((element) => ({ tag: element.tagName, text: element.textContent?.trim().replace(/\s+/g, ' ').slice(0, 80), id: element.id, width: Math.round(element.getBoundingClientRect().width), height: Math.round(element.getBoundingClientRect().height) })),
  }));
  report.mobileDemo = {
    errors, layout,
    counts: {
      accounted: await page.locator('#accounted-count').textContent(),
      missing: await page.locator('#missing-count').textContent(),
      changed: await page.locator('#changed-count').textContent(),
      coverage: await page.locator('#coverage-score').textContent(),
    },
    axe: axe.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })),
  };
  await page.screenshot({ path: '.factory/qa-evidence/live-mobile-demo-full.png', fullPage: true });
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  const requests = [];
  observe(page, errors);
  page.on('request', (request) => requests.push(request.url()));
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await chooseVirtualFolder(page, '#source-input', 'Phone', [
    { path: 'DCIM/Camera/same.jpg', body: 'same photo' },
    { path: 'DCIM/Camera/changed.jpg', body: 'original photo' },
    { path: 'Download/missing.pdf', body: 'missing document' },
    { path: 'Exports/messages.backup', body: 'same export' },
  ]);
  await page.locator('#source-status').getByText('4 files', { exact: false }).waitFor();
  await chooseVirtualFolder(page, '#destination-input', 'USB', [
    { path: 'DCIM/Camera/same.jpg', body: 'same photo' },
    { path: 'DCIM/Camera/changed.jpg', body: 'changed photo' },
    { path: 'Exports/messages.backup', body: 'same export' },
    { path: 'Download/extra.txt', body: 'destination only' },
  ]);
  await page.locator('#compare-button').click();
  const receiptDownload = page.waitForEvent('download');
  await page.locator('#export-receipt').click();
  const receiptPath = await (await receiptDownload).path();
  const receipt = JSON.parse(await readFile(receiptPath, 'utf8'));
  const csvDownload = page.waitForEvent('download');
  await page.locator('#export-csv').click();
  const csvPath = await (await csvDownload).path();
  const csv = await readFile(csvPath, 'utf8');
  const beforeReload = await page.locator('#ready-summary').textContent();
  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await page.locator('#source-status').textContent();
  await page.locator('#compare-button').click();
  await page.locator('#new-check').click();
  report.normalFlow = {
    errors,
    externalRequests: requests.filter((url) => new URL(url).origin !== origin),
    receipt: { schema: receipt.schema, accounted: receipt.accounted, missing: receipt.missing, changed: receipt.changed, extra: receipt.extra, coverage: receipt.coverage },
    csvLines: csv.trim().split('\n'), beforeReload, afterReload,
    afterClear: await page.locator('#source-status').textContent(),
    focusAfterClear: await page.evaluate(() => document.activeElement?.id),
  };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.locator('#source-input').evaluate((input) => {
    const transfer = new DataTransfer();
    for (const [name, size] of [['exact.bin', 32 * 1024 * 1024], ['over.bin', 32 * 1024 * 1024 + 1]]) {
      const file = new File([new Uint8Array(size)], name, { lastModified: 1 });
      Object.defineProperty(file, 'webkitRelativePath', { value: `Boundary/${name}` });
      transfer.items.add(file);
    }
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.locator('#source-status').getByText('2 files', { exact: false }).waitFor({ timeout: 60000 });
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-source-manifest').click();
  const manifestPath = await (await downloadPromise).path();
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  report.hashBoundary = manifest.files.map((file) => ({ path: file.path, size: file.size, hashMethod: file.hashMethod, hashLength: file.hash.length }));
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.locator('#source-input').evaluate((input) => {
    Object.defineProperty(input, 'files', { configurable: true, value: new DataTransfer().files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  const emptyMessage = await page.locator('#source-status').textContent();
  await page.locator('#manifest-input').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  const malformedMessage = await page.locator('#destination-status').textContent();
  await page.locator('#manifest-input').setInputFiles({ name: 'wrong.json', mimeType: 'application/json', buffer: Buffer.from('{"schema":"wrong","files":[]}') });
  const schemaMessage = await page.locator('#destination-status').textContent();
  await page.locator('#license-form button').click();
  const emptyLicense = await page.locator('#license-status').textContent();
  report.recovery = { emptyMessage, malformedMessage, schemaMessage, emptyLicense };
  await context.close();
}

{
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  const skipFocused = await page.locator('.skip-link').evaluate((element) => element === document.activeElement);
  const skipFocusStyle = await page.locator('.skip-link').evaluate((element) => {
    const style = getComputedStyle(element);
    return { outline: style.outline, boxShadow: style.boxShadow };
  });
  await page.keyboard.press('Enter');
  const focusAfterSkip = await page.evaluate(() => document.activeElement?.id);
  const tabStops = [];
  for (let i = 0; i < 35; i += 1) {
    await page.keyboard.press('Tab');
    tabStops.push(await page.evaluate(() => ({ tag: document.activeElement?.tagName, id: document.activeElement?.id, text: document.activeElement?.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60) })));
  }
  const motion = await page.evaluate(() => ({
    mediaMatches: matchMedia('(prefers-reduced-motion: reduce)').matches,
    htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    transitions: [...document.querySelectorAll('a,button,.hero-art')].map((element) => getComputedStyle(element).transitionDuration).filter((value, index, all) => all.indexOf(value) === index),
    animations: [...document.querySelectorAll('*')].map((element) => getComputedStyle(element).animationDuration).filter((value) => value !== '0s').slice(0, 10),
  }));
  report.keyboardMotion = { skipFocused, skipFocusStyle, focusAfterSkip, tabStops, motion };
  await context.close();
}

for (const path of ['/privacy/', '/terms/', '/does-not-exist']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  observe(page, errors);
  const response = await page.goto(`${origin}${path}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page }).analyze();
  report[path] = { status: response?.status(), title: await page.title(), h1: await page.locator('h1').allTextContents(), errors, axe: axe.violations.map((item) => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })) };
  await context.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
