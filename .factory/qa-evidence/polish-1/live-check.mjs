import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { writeFile } from 'node:fs/promises';

const origin = 'https://android-backup-receipt.sociobot.in';
const browser = await chromium.launch({ headless: true });
const report = { checkedAt: new Date().toISOString(), origin, checks: {}, errors: [] };

function check(name, value, detail = value) {
  report.checks[name] = detail;
  if (!value) throw new Error(`Failed: ${name}`);
}

async function chooseFolder(target, selector, folder, files) {
  await target.locator(selector).evaluate((input, payload) => {
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

const context = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const page = await context.newPage();
page.on('console', (message) => { if (message.type() === 'error') report.errors.push(`console: ${message.text()}`); });
page.on('pageerror', (error) => report.errors.push(`page: ${error.message}`));
const external = [];
page.on('request', (request) => { if (new URL(request.url()).origin !== origin) external.push(request.url()); });

await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
check('home-title', await page.title() === 'Android Backup Receipt — check a phone backup', await page.title());
check('first-screen-copy', (await page.locator('h1').innerText()).includes('Check an Android backup') && (await page.locator('.lede').innerText()).includes('which selected files match'));
check('mobile-home-no-overflow', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
await page.screenshot({ path: '.factory/qa-evidence/polish-1/live/home-mobile-cold.png', fullPage: true });
await page.locator('.hero-actions a[href="/demo"]').click();
await page.waitForLoadState('networkidle');
check('demo-url', page.url() === `${origin}/demo`, page.url());
check('demo-title', await page.title() === 'Demo — Android Backup Receipt', await page.title());
check('demo-canonical', await page.locator('link[rel="canonical"]').getAttribute('href') === `${origin}/demo`);
check('demo-focused-heading', await page.locator('h1').evaluate((node) => node === document.activeElement));
for (const selector of ['#receipt', '#accounted-count', '#missing-count', '#changed-count', '.issue-list', '#export-receipt', '#export-csv']) {
  const box = await page.locator(selector).boundingBox();
  check(`demo-first-screen:${selector}`, Boolean(box && box.y >= 0 && box.y + box.height <= 844), box);
}
check('demo-counts', await page.locator('#coverage-score').innerText() === '50%' && await page.locator('#accounted-count').innerText() === '2');
await page.screenshot({ path: '.factory/qa-evidence/polish-1/live/demo-mobile-cold.png', fullPage: true });
await page.locator('#reset-demo').click();
check('demo-reset', await page.locator('#coverage-score').innerText() === '50%');
check('same-origin-demo', external.length === 0, external);
const axeDemo = await new AxeBuilder({ page }).analyze();
check('axe-demo-serious-critical', axeDemo.violations.every((item) => !['serious', 'critical'].includes(item.impact ?? '')), axeDemo.violations.map((item) => item.id));

await page.evaluate(() => navigator.serviceWorker.ready);
await page.reload({ waitUntil: 'domcontentloaded' });
await context.setOffline(true);
await page.evaluate(() => window.dispatchEvent(new Event('offline')));
await page.reload({ waitUntil: 'domcontentloaded' });
for (const selector of ['#export-receipt', '#export-csv']) {
  const pending = page.waitForEvent('download');
  await page.locator(selector).click();
  check(`offline-download:${selector}`, Boolean(await (await pending).path()));
}
check('offline-demo-reload', await page.locator('#coverage-score').innerText() === '50%');
await context.setOffline(false);

for (const route of ['/privacy/', '/terms/', '/404-does-not-exist']) {
  const routeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const routePage = await routeContext.newPage();
  const response = await routePage.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
  check(`status:${route}`, response?.status() === (route.startsWith('/404') ? 404 : 200), response?.status());
  check(`metadata:${route}`, await routePage.locator('link[rel="canonical"]').count() === 1 && await routePage.locator('meta[property="og:title"]').count() === 1 && await routePage.locator('meta[name="twitter:title"]').count() === 1);
  check(`shell:${route}`, await routePage.locator('header nav a').count() === 3 && await routePage.locator('footer a[href="/privacy/"]').count() === 1 && await routePage.locator('footer a[href="/terms/"]').count() === 1);
  check(`focus:${route}`, await routePage.locator('h1').evaluate((node) => node === document.activeElement));
  check(`overflow:${route}`, await routePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const axe = await new AxeBuilder({ page: routePage }).analyze();
  check(`axe:${route}`, axe.violations.every((item) => !['serious', 'critical'].includes(item.impact ?? '')), axe.violations.map((item) => item.id));
  await routeContext.close();
}

const realContext = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
const realPage = await realContext.newPage();
await realPage.goto(`${origin}/`);
await chooseFolder(realPage, '#source-input', 'DCIM', [{ path: 'Camera/a.jpg', body: 'a' }]);
await chooseFolder(realPage, '#destination-input', 'DCIM-backup', [{ path: 'Camera/a.jpg', body: 'a' }]);
await realPage.locator('#add-pair').click();
await chooseFolder(realPage, '#source-input', 'Documents', [{ path: 'notes.txt', body: 'notes' }]);
await chooseFolder(realPage, '#destination-input', 'Documents-backup', [{ path: 'notes.txt', body: 'changed' }]);
await realPage.locator('#compare-button').click();
check('multi-folder-pair-rows', await realPage.locator('#pair-results .pair-result').count() === 2);
check('multi-folder-combined-counts', await realPage.locator('#accounted-count').innerText() === '1' && await realPage.locator('#changed-count').innerText() === '1');
await realPage.screenshot({ path: '.factory/qa-evidence/polish-1/live/multi-folder-mobile.png', fullPage: true });
await realContext.close();

check('console-errors', report.errors.length === 0, report.errors);
await writeFile('.factory/qa-evidence/polish-1/live/report.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
