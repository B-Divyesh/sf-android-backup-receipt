import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const origin = 'https://android-backup-receipt.sociobot.in';
const evidenceDir = '.factory/qa-artifacts';
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const report = {
  checkedAt: new Date().toISOString(),
  origin,
  checks: {},
  failures: [],
  consoleErrors: [],
  pageErrors: [],
  requests: []
};

function record(name, pass, evidence) {
  report.checks[name] = { pass, evidence };
  if (!pass) report.failures.push(name);
}

function watch(page) {
  page.on('console', message => {
    if (message.type() === 'error') report.consoleErrors.push(`${page.url()} :: ${message.text()}`);
  });
  page.on('pageerror', error => report.pageErrors.push(`${page.url()} :: ${error.message}`));
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
  facts: [...document.querySelectorAll('.trust-strip li')].map(node => node.textContent.replace(/\s+/g, ' ').trim()),
  h1Count: document.querySelectorAll('h1').length,
  mainCount: document.querySelectorAll('main').length,
  missingAlt: [...document.querySelectorAll('img')].filter(img => !img.hasAttribute('alt')).length
}));
record('cold-first-read', homeResponse?.status() === 200 && firstRead.h1Count === 1 && firstRead.mainCount === 1 && firstRead.lang === 'en' && firstRead.missingAlt === 0 && firstRead.h1[0]?.includes('Check an Android backup') && firstRead.lede?.includes('Android owners moving phones') && firstRead.primary?.includes('Try it with sample data'), firstRead);
const homeAxe = await new AxeBuilder({ page: home }).analyze();
record('axe-home', homeAxe.violations.length === 0, homeAxe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
await home.screenshot({ path: `${evidenceDir}/live-home-desktop-8.png`, fullPage: true });

const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await mobile.newPage();
watch(page);
await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
const mobileGeometry = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  viewportWidth: innerWidth,
  factsBottom: document.querySelector('.trust-strip')?.getBoundingClientRect().bottom,
  primaryBottom: document.querySelector('.hero-actions a[href="/demo"]')?.getBoundingClientRect().bottom
}));
record('mobile-first-screen', mobileGeometry.scrollWidth <= 390 && mobileGeometry.factsBottom <= 844 && mobileGeometry.primaryBottom <= 844, mobileGeometry);
await page.screenshot({ path: `${evidenceDir}/live-home-mobile-8.png`, fullPage: true });

await page.keyboard.press('Tab');
const skipFocused = await page.locator('.skip-link').evaluate(node => node === document.activeElement);
const focusStyle = await page.locator('.skip-link').evaluate(node => {
  const style = getComputedStyle(node);
  return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor, offset: style.outlineOffset };
});
await page.keyboard.press('Enter');
const mainFocused = await page.locator('#main').evaluate(node => node === document.activeElement);
const chooserPromise = page.waitForEvent('filechooser');
await page.locator('#source-picker').focus();
await page.keyboard.press('Enter');
await chooserPromise;
record('keyboard-and-focus', skipFocused && mainFocused && focusStyle.width === '3px' && focusStyle.style !== 'none', { skipFocused, mainFocused, focusStyle, folderChooserOpened: true });

const visibleTargets = await page.locator('a, button, input, label').evaluateAll(nodes => nodes.filter(node => {
  const rect = node.getBoundingClientRect();
  const style = getComputedStyle(node);
  return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && node.getAttribute('aria-hidden') !== 'true';
}).map(node => {
  const rect = node.getBoundingClientRect();
  return { text: (node.textContent || node.getAttribute('aria-label') || node.id || node.tagName).replace(/\s+/g, ' ').trim().slice(0, 80), tag: node.tagName, width: Math.round(rect.width), height: Math.round(rect.height) };
}));
const undersizedTargets = visibleTargets.filter(item => item.width < 44 || item.height < 44);
record('mobile-touch-targets', undersizedTargets.length === 0, { checked: visibleTargets.length, undersizedTargets });

await page.locator('.hero-actions a[href="/demo"]').click();
await page.waitForLoadState('networkidle');
const demo = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  h1Focused: document.activeElement === document.querySelector('h1'),
  banner: document.querySelector('#demo-banner')?.textContent.replace(/\s+/g, ' ').trim(),
  counts: {
    coverage: document.querySelector('#coverage-score')?.textContent,
    accounted: document.querySelector('#accounted-count')?.textContent,
    missing: document.querySelector('#missing-count')?.textContent,
    changed: document.querySelector('#changed-count')?.textContent,
    extraShown: document.querySelector('#pair-results')?.textContent.includes('1 extra')
  },
  receiptBottom: document.querySelector('#receipt')?.getBoundingClientRect().bottom,
  viewportHeight: innerHeight,
  scrollWidth: document.documentElement.scrollWidth
}));
record('one-click-demo', demo.url === `${origin}/demo` && demo.h1Focused && demo.banner?.includes('nothing is saved') && demo.counts.coverage === '50%' && demo.counts.accounted === '2' && demo.counts.missing === '1' && demo.counts.changed === '1' && demo.counts.extraShown && demo.receiptBottom <= demo.viewportHeight && demo.scrollWidth <= 390, demo);
const demoAxe = await new AxeBuilder({ page }).analyze();
record('axe-demo', demoAxe.violations.length === 0, demoAxe.violations.map(item => ({ id: item.id, impact: item.impact, nodes: item.nodes.length })));
await page.screenshot({ path: `${evidenceDir}/live-demo-mobile-8.png`, fullPage: true });

const jsonPending = page.waitForEvent('download');
await page.locator('#export-receipt').click();
const jsonDownload = await jsonPending;
const json = JSON.parse(await readFile(await jsonDownload.path(), 'utf8'));
const csvPending = page.waitForEvent('download');
await page.locator('#export-csv').click();
const csvDownload = await csvPending;
const csv = await readFile(await csvDownload.path(), 'utf8');
record('live-demo-exports', json.schema === 'backup-receipt/result-1' && json.missing === 1 && json.changed === 1 && csv.includes('missing') && csv.includes('changed'), { json: { schema: json.schema, total: json.total, accounted: json.accounted, missing: json.missing, changed: json.changed, extra: json.extra }, csvLines: csv.trim().split('\n').length });

const swEvidence = await page.evaluate(async () => {
  const registration = await navigator.serviceWorker.ready;
  await registration.update();
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    controlled: Boolean(navigator.serviceWorker.controller),
    activeState: registration.active?.state,
    waitingState: registration.waiting?.state || null,
    installingState: registration.installing?.state || null,
    caches: await caches.keys()
  };
});
record('service-worker-update-check', swEvidence.controlled && swEvidence.activeState === 'activated' && swEvidence.caches.some(name => name.endsWith('-shell')), swEvidence);
await page.reload({ waitUntil: 'domcontentloaded' });
await mobile.setOffline(true);
await page.evaluate(() => window.dispatchEvent(new Event('offline')));
await page.reload({ waitUntil: 'domcontentloaded' });
await page.locator('#receipt:not([hidden])').waitFor();
const offline = await page.evaluate(async () => ({
  offlineBanner: !document.querySelector('#offline-banner')?.hasAttribute('hidden'),
  demoBanner: !document.querySelector('#demo-banner')?.hasAttribute('hidden'),
  receipt: !document.querySelector('#receipt')?.hasAttribute('hidden'),
  coverage: document.querySelector('#coverage-score')?.textContent,
  controlled: Boolean(navigator.serviceWorker.controller),
  caches: await caches.keys()
}));
for (const selector of ['#export-receipt', '#export-csv']) {
  const pending = page.waitForEvent('download');
  await page.locator(selector).click();
  const download = await pending;
  offline[`${selector}-download`] = Boolean(await download.path());
}
record('offline-reload-and-exports', offline.offlineBanner && offline.demoBanner && offline.receipt && offline.coverage === '50%' && offline.controlled && offline['#export-receipt-download'] && offline['#export-csv-download'], offline);
await mobile.setOffline(false);

const realContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const real = await realContext.newPage();
watch(real);
await real.goto(`${origin}/`, { waitUntil: 'networkidle' });
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
const normal = await real.evaluate(() => ({
  accounted: document.querySelector('#accounted-count')?.textContent,
  missing: document.querySelector('#missing-count')?.textContent,
  changed: document.querySelector('#changed-count')?.textContent,
  extraShown: document.querySelector('#pair-results')?.textContent.includes('1 extra'),
  conclusion: document.querySelector('#receipt-conclusion')?.textContent
}));
record('normal-folder-comparison', normal.accounted === '1' && normal.missing === '1' && normal.changed === '1' && normal.extraShown && normal.conclusion?.includes('Do not wipe'), normal);
await real.reload({ waitUntil: 'networkidle' });
const resumed = (await real.locator('#source-status').innerText()).includes('restored phone folder') && (await real.locator('#destination-status').innerText()).includes('restored backup folder');
await real.locator('#compare-button').click();
await real.locator('#new-check').click();
const cleared = (await real.locator('#source-status').innerText()) === 'No phone folder selected' && (await real.locator('#destination-status').innerText()) === 'No backup folder selected';
record('resume-and-clear', resumed && cleared, { resumed, cleared });
await real.locator('#manifest-input').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{broken') });
const malformed = await real.locator('#destination-status').innerText();
await real.locator('#manifest-input').setInputFiles({ name: 'unsupported.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ schema: 'wrong', files: [] })) });
const unsupported = await real.locator('#destination-status').innerText();
record('invalid-input-recovery', malformed.includes('not a valid folder record') && unsupported.includes('version is not supported'), { malformed, unsupported });
await realContext.close();

const routeResults = [];
for (const route of ['/privacy/', '/terms/', '/offline.html', '/route-that-does-not-exist-verification-8']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const routePage = await context.newPage();
  if (!route.includes('does-not-exist')) watch(routePage);
  const response = await routePage.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  const axe = await new AxeBuilder({ page: routePage }).analyze();
  const semantics = await routePage.evaluate(() => ({
    title: document.title,
    lang: document.documentElement.lang,
    h1: document.querySelectorAll('h1').length,
    main: document.querySelectorAll('main').length,
    missingAlt: [...document.querySelectorAll('img')].filter(img => !img.hasAttribute('alt')).length,
    overflow: document.documentElement.scrollWidth > innerWidth,
    headingFocused: document.activeElement === document.querySelector('h1')
  }));
  routeResults.push({ route, status: response?.status(), ...semantics, axe: axe.violations.filter(item => ['serious', 'critical'].includes(item.impact ?? '')).map(item => item.id) });
  await context.close();
}
record('legal-offline-404-routes', routeResults.every(item => item.status === (item.route.includes('does-not-exist') ? 404 : 200) && item.lang === 'en' && item.h1 === 1 && item.main === 1 && item.missingAlt === 0 && !item.overflow && item.headingFocused && item.axe.length === 0), routeResults);

const reduced = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
const reducedPage = await reduced.newPage();
watch(reducedPage);
await reducedPage.goto(`${origin}/`, { waitUntil: 'networkidle' });
const motion = await reducedPage.evaluate(() => {
  const style = getComputedStyle(document.querySelector('.button'));
  return { matches: matchMedia('(prefers-reduced-motion: reduce)').matches, transitionDuration: style.transitionDuration, animationDuration: style.animationDuration, scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior };
});
record('reduced-motion', motion.matches && motion.transitionDuration.split(',').every(value => parseFloat(value) <= 0.001) && parseFloat(motion.animationDuration) <= 0.001 && motion.scrollBehavior === 'auto', motion);
await reduced.close();

const resize = await browser.newContext({ viewport: { width: 390, height: 844 } });
const resizePage = await resize.newPage();
watch(resizePage);
await resizePage.goto(`${origin}/`, { waitUntil: 'networkidle' });
const resized = await resizePage.evaluate(() => {
  document.documentElement.style.fontSize = '200%';
  return { scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth, primaryVisible: Boolean(document.querySelector('.hero-actions a[href="/demo"]')?.getBoundingClientRect().height) };
});
record('text-resize-200-percent', resized.scrollWidth <= resized.viewportWidth && resized.primaryVisible, resized);
await resize.close();

const uniqueRequests = [...new Set(report.requests)];
const external = uniqueRequests.filter(value => new URL(value).origin !== origin);
record('core-flow-request-privacy', external.length === 0, { uniqueRequests, external });
record('console-and-page-errors', report.consoleErrors.length === 0 && report.pageErrors.length === 0, { consoleErrors: report.consoleErrors, pageErrors: report.pageErrors });

await desktop.close();
await mobile.close();
await writeFile(`${evidenceDir}/live-report-8.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
process.exitCode = report.failures.length === 0 ? 0 : 1;
