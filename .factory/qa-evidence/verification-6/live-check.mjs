import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'https://android-backup-receipt.sociobot.in';
const evidenceDir = '.factory/qa-evidence/verification-6';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = { checkedAt: new Date().toISOString(), origin, checks: {}, failures: [], console: [], requests: [] };

function record(name, pass, evidence) {
  report.checks[name] = { pass, evidence };
  if (!pass) report.failures.push(name);
}

function watch(page) {
  page.on('console', message => {
    if (message.type() === 'error' || message.type() === 'warning') report.console.push(`${message.type()}: ${message.text()}`);
  });
  page.on('pageerror', error => report.console.push(`pageerror: ${error.message}`));
  page.on('request', request => report.requests.push(request.url()));
}

async function chooseFolder(page, selector, folder, files) {
  await page.locator(selector).evaluate((input, payload) => {
    const transfer = new DataTransfer();
    for (const entry of payload.files) {
      const file = new File([entry.body], entry.path.split('/').pop(), { lastModified: 1 });
      Object.defineProperty(file, 'webkitRelativePath', { value: `${payload.folder}/${entry.path}` });
      transfer.items.add(file);
    }
    Object.defineProperty(input, 'files', { configurable: true, value: transfer.files });
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, { folder, files });
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const home = await desktop.newPage();
watch(home);
const homeResponse = await home.goto(`${origin}/`, { waitUntil: 'networkidle' });
const firstRead = await home.evaluate(() => ({
  title: document.title,
  lang: document.documentElement.lang,
  h1: [...document.querySelectorAll('h1')].map(node => node.textContent.trim()),
  lede: document.querySelector('.lede')?.textContent.trim(),
  primary: document.querySelector('.hero-actions a[href="/demo"]')?.textContent.trim(),
  facts: [...document.querySelectorAll('.trust-strip li')].map(node => node.textContent.trim()),
  h1Count: document.querySelectorAll('h1').length,
  mainCount: document.querySelectorAll('main').length
}));
record('cold-first-read', homeResponse?.status() === 200 && firstRead.h1[0]?.includes('Check an Android backup') && firstRead.lede?.includes('Android owners moving phones') && firstRead.primary?.includes('Try it with sample data'), firstRead);
const homeAxe = await new AxeBuilder({ page: home }).analyze();
const homeSerious = homeAxe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
record('axe-home-serious-critical', homeSerious.length === 0, homeSerious.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
await home.screenshot({ path: `${evidenceDir}/home-desktop-cold.png`, fullPage: false });

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await mobile.newPage();
watch(page);
await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
const mobileGeometry = await page.evaluate(() => ({
  viewport: { width: innerWidth, height: innerHeight },
  scrollWidth: document.documentElement.scrollWidth,
  facts: document.querySelector('.trust-strip')?.getBoundingClientRect().toJSON(),
  primary: document.querySelector('.hero-actions a[href="/demo"]')?.getBoundingClientRect().toJSON()
}));
record('mobile-first-screen', mobileGeometry.scrollWidth <= 390 && mobileGeometry.facts.bottom <= 844 && mobileGeometry.primary.bottom <= 844, mobileGeometry);
await page.screenshot({ path: `${evidenceDir}/home-mobile.png`, fullPage: true });

await page.keyboard.press('Tab');
const skipFocus = await page.locator('.skip-link').evaluate(node => node === document.activeElement);
const focusStyle = await page.locator('.skip-link').evaluate(node => {
  const style = getComputedStyle(node);
  return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor, offset: style.outlineOffset };
});
await page.keyboard.press('Enter');
const mainFocus = await page.locator('#main').evaluate(node => node === document.activeElement);
record('keyboard-skip-and-focus', skipFocus && mainFocus && focusStyle.width === '3px' && focusStyle.style !== 'none', { skipFocus, mainFocus, focusStyle });

await page.locator('.hero-actions a[href="/demo"]').click();
await page.waitForLoadState('networkidle');
const demo = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  banner: document.querySelector('#demo-banner')?.textContent.replace(/\s+/g, ' ').trim(),
  receipt: document.querySelector('#receipt')?.getBoundingClientRect().toJSON(),
  counts: {
    coverage: document.querySelector('#coverage-score')?.textContent,
    matched: document.querySelector('#accounted-count')?.textContent,
    missing: document.querySelector('#missing-count')?.textContent,
    changed: document.querySelector('#changed-count')?.textContent
  },
  downloads: ['#export-receipt', '#export-csv'].map(selector => document.querySelector(selector)?.getBoundingClientRect().toJSON())
}));
record('demo-one-click-value', demo.url === `${origin}/demo` && demo.banner?.includes('nothing is saved') && demo.counts.coverage === '50%' && demo.counts.matched === '2' && demo.counts.missing === '1' && demo.counts.changed === '1' && demo.downloads.every(box => box.bottom <= 844), demo);

const jsonPending = page.waitForEvent('download');
await page.locator('#export-receipt').click();
const jsonDownload = await jsonPending;
const jsonReceipt = JSON.parse(await readFile(await jsonDownload.path(), 'utf8'));
const csvPending = page.waitForEvent('download');
await page.locator('#export-csv').click();
const csvDownload = await csvPending;
const csvReceipt = await readFile(await csvDownload.path(), 'utf8');
record('demo-exports', jsonReceipt.schema === 'backup-receipt/result-1' && jsonReceipt.missing === 1 && jsonReceipt.changed === 1 && csvReceipt.includes('changed') && csvReceipt.includes('missing'), { json: { schema: jsonReceipt.schema, missing: jsonReceipt.missing, changed: jsonReceipt.changed }, csvLines: csvReceipt.trim().split('\n').length });

const demoAxe = await new AxeBuilder({ page }).analyze();
const demoSerious = demoAxe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? ''));
record('axe-demo-serious-critical', demoSerious.length === 0, demoSerious.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
await page.screenshot({ path: `${evidenceDir}/demo-mobile.png`, fullPage: true });

await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(300);
await page.reload({ waitUntil: 'domcontentloaded' });
await mobile.setOffline(true);
await page.evaluate(() => window.dispatchEvent(new Event('offline')));
await page.reload({ waitUntil: 'domcontentloaded' });
await page.locator('#receipt:not([hidden])').waitFor();
const offline = await page.evaluate(async () => ({
  banner: !document.querySelector('#offline-banner')?.hasAttribute('hidden'),
  receipt: !document.querySelector('#receipt')?.hasAttribute('hidden'),
  coverage: document.querySelector('#coverage-score')?.textContent,
  controller: Boolean(navigator.serviceWorker.controller),
  caches: await caches.keys()
}));
record('live-offline-reload', offline.banner && offline.receipt && offline.coverage === '50%' && offline.controller, offline);
for (const selector of ['#export-receipt', '#export-csv']) {
  const pending = page.waitForEvent('download');
  await page.locator(selector).click();
  const download = await pending;
  record(`live-offline-download:${selector}`, Boolean(await download.path()), await download.suggestedFilename());
}
await mobile.setOffline(false);

const externalCoreRequests = [...new Set(report.requests)].filter(value => new URL(value).origin !== origin);
record('core-flow-request-privacy', externalCoreRequests.length === 0, { uniqueRequests: [...new Set(report.requests)], external: externalCoreRequests });

const routeResults = [];
for (const route of ['/privacy/', '/terms/', '/not-a-real-route-verification-6']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const routePage = await context.newPage();
  if (!route.startsWith('/not-')) watch(routePage);
  const response = await routePage.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page: routePage }).analyze();
  const data = await routePage.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    focusedHeading: document.activeElement === document.querySelector('h1'),
    overflow: document.documentElement.scrollWidth > innerWidth,
    missingAlt: [...document.querySelectorAll('img')].filter(img => !img.hasAttribute('alt')).length
  }));
  routeResults.push({ route, status: response?.status(), ...data, seriousCritical: axe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')).map(item => item.id) });
  await context.close();
}
record('legal-and-404-routes', routeResults.every(item => item.status === (item.route.startsWith('/not-') ? 404 : 200) && item.lang === 'en' && item.h1 === 1 && item.main === 1 && item.focusedHeading && !item.overflow && item.missingAlt === 0 && item.seriousCritical.length === 0), routeResults);

const realContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const real = await realContext.newPage();
watch(real);
await real.goto(`${origin}/`);
await chooseFolder(real, '#source-input', 'DCIM', [
  { path: 'Camera/same.jpg', body: 'same bytes' },
  { path: 'Camera/changed.jpg', body: 'original bytes' },
  { path: 'Documents/missing.txt', body: 'missing bytes' }
]);
await chooseFolder(real, '#destination-input', 'USB-backup', [
  { path: 'Camera/same.jpg', body: 'same bytes' },
  { path: 'Camera/changed.jpg', body: 'different bytes' },
  { path: 'extra.txt', body: 'extra bytes' }
]);
await real.locator('#compare-button').click();
const normalCounts = await real.evaluate(() => ({
  matched: document.querySelector('#accounted-count')?.textContent,
  missing: document.querySelector('#missing-count')?.textContent,
  changed: document.querySelector('#changed-count')?.textContent,
  conclusion: document.querySelector('#receipt-conclusion')?.textContent
}));
record('normal-real-folder-flow', normalCounts.matched === '1' && normalCounts.missing === '1' && normalCounts.changed === '1' && normalCounts.conclusion?.includes('Do not wipe'), normalCounts);
await real.reload();
const resumed = (await real.locator('#source-status').innerText()).includes('restored phone folder') && (await real.locator('#destination-status').innerText()).includes('restored backup folder');
await real.locator('#compare-button').click();
await real.locator('#new-check').click();
record('resume-and-clear', resumed && (await real.locator('#source-status').innerText()) === 'No phone folder selected' && (await real.locator('#destination-status').innerText()) === 'No backup folder selected', { resumed });

await real.locator('#manifest-input').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
const malformedMessage = await real.locator('#destination-status').innerText();
await real.locator('#manifest-input').setInputFiles({ name: 'unsupported.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ schema: 'unknown', files: [] })) });
const unsupportedMessage = await real.locator('#destination-status').innerText();
record('invalid-manifest-recovery', malformedMessage.includes('not a valid folder record') && unsupportedMessage.includes('version is not supported'), { malformedMessage, unsupportedMessage });
await realContext.close();

const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
watch(reducedPage);
await reducedPage.goto(`${origin}/`);
const motion = await reducedPage.evaluate(() => {
  const style = getComputedStyle(document.querySelector('.button'));
  return { matches: matchMedia('(prefers-reduced-motion: reduce)').matches, transitionDuration: style.transitionDuration, animationDuration: style.animationDuration, animationIterationCount: style.animationIterationCount };
});
record('reduced-motion', motion.matches && motion.transitionDuration.split(',').every(value => parseFloat(value) <= 0.001) && parseFloat(motion.animationDuration) <= 0.001, motion);
await reduced.close();

record('console-and-page-errors', report.console.length === 0, report.console);
await writeFile(`${evidenceDir}/live-report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exitCode = report.failures.length === 0 ? 0 : 1;
