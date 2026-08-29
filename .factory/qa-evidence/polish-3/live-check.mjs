import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const base = 'https://android-backup-receipt.sociobot.in';
const evidence = '.factory/qa-evidence/polish-3/live';
const browser = await chromium.launch();
const report = { base, errors: [], routes: {}, home: {}, demo: {}, back: {}, offline: {}, axe: {} };

function check(condition, message) {
  if (!condition) throw new Error(message);
}

async function axe(page, name) {
  const result = await new AxeBuilder({ page }).analyze();
  report.axe[name] = result.violations.map(({ id, impact }) => ({ id, impact }));
  check(result.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical').length === 0, `${name} has serious axe findings`);
}

const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await context.newPage();
page.on('console', (message) => {
  const location = message.location().url;
  if (message.type() === 'error' && !location.endsWith('/missing-route')) report.errors.push(message.text());
});
page.on('pageerror', (error) => report.errors.push(String(error)));

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
const facts = await page.locator('.trust-strip').boundingBox();
const action = await page.locator('.action-outcome').boundingBox();
check((facts?.y ?? 900) + (facts?.height ?? 900) <= 844, 'first-screen facts fall below the mobile viewport');
check((action?.y ?? 900) + (action?.height ?? 900) <= 844, 'sample result falls below the mobile viewport');
check(await page.locator('.trust-strip').innerText() === 'Files\nstay on this device\nOffline\nafter the first visit\nChecks are free\nhistory costs $7 once', 'first-screen facts changed');
check(await page.locator('.action-outcome').innerText() === 'Opens a four-file receipt with two problems.', 'sample action result changed');
report.home = { title: await page.title(), facts, action, scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth) };
await page.screenshot({ path: `${evidence}/home-mobile-cold.png`, fullPage: true });
await axe(page, 'home');

await page.locator('.hero-actions a[href="/demo"]').click();
await page.waitForLoadState('networkidle');
const demoTargets = {};
for (const selector of ['#receipt', '#accounted-count', '#missing-count', '#changed-count', '.issue-list', '#export-receipt', '#export-csv']) {
  const box = await page.locator(selector).boundingBox();
  check((box?.y ?? 900) >= 0 && (box?.y ?? 900) + (box?.height ?? 900) <= 844, `${selector} misses first demo viewport`);
  demoTargets[selector] = box;
}
check(await page.locator('#coverage-score').innerText() === '50%', 'demo coverage is not 50%');
check(await page.locator('#receipt-conclusion').innerText() === 'Do not wipe your phone yet: 1 file is missing and 1 has changed.', 'demo warning changed');
report.demo = { title: await page.title(), targets: demoTargets, focusedHeading: await page.locator('h1').evaluate((node) => document.activeElement === node) };
await page.screenshot({ path: `${evidence}/demo-mobile-cold.png`, fullPage: true });
await axe(page, 'demo');

await page.goBack({ waitUntil: 'networkidle' });
report.back = {
  title: await page.title(),
  h1: await page.locator('h1').innerText(),
  demoHidden: await page.locator('#demo-banner').isHidden(),
  receiptHidden: await page.locator('#receipt').isHidden(),
  focusedHeading: await page.locator('h1').evaluate((node) => document.activeElement === node),
  announcement: await page.locator('#route-announcement').innerText()
};
check(report.back.title === 'Android Backup Receipt — check a phone backup', 'Back did not restore home title');
check(report.back.demoHidden && report.back.receiptHidden && report.back.focusedHeading, 'Back did not restore home state');

for (const [name, route, expectedTitle] of [
  ['privacy', '/privacy/', 'Privacy — Android Backup Receipt'],
  ['terms', '/terms/', 'Terms — Android Backup Receipt'],
  ['offline', '/offline.html', 'Offline — Android Backup Receipt'],
  ['notFound', '/missing-route', 'Page not found — Android Backup Receipt']
]) {
  await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(100);
  const result = {
    title: await page.title(),
    h1: await page.locator('h1').count(),
    main: await page.locator('main').count(),
    canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
    og: await page.locator('meta[property="og:title"]').getAttribute('content'),
    twitter: await page.locator('meta[name="twitter:title"]').getAttribute('content'),
    nav: await page.locator('header nav a').count(),
    privacy: await page.locator('footer a[href="/privacy/"]').count(),
    terms: await page.locator('footer a[href="/terms/"]').count(),
    focusedHeading: await page.locator('h1').evaluate((node) => document.activeElement === node)
  };
  check(result.title === expectedTitle && result.h1 === 1 && result.main === 1, `${name} route structure failed`);
  check(Boolean(result.canonical && result.og && result.twitter), `${name} metadata is incomplete`);
  check(result.nav === 3 && result.privacy === 1 && result.terms === 1, `${name} shared shell is incomplete`);
  check(result.focusedHeading, `${name} heading is not focused`);
  report.routes[name] = result;
  await axe(page, name);
}

await page.goto(`${base}/`, { waitUntil: 'networkidle' });
const productText = await page.locator('body').textContent();
check(productText.includes('Check a WebDAV or S3 backup'), 'remote-provider guide is absent');
check(productText.includes('Saved receipt history') && productText.includes('Clear receipt history'), 'receipt-history terminology is inconsistent');
check(!productText.includes('Sociobot/Dodo') && !productText.includes('refund revokes'), 'unproved billing copy remains');
check(productText.includes('download APK checksums'), 'APK checksum wording is absent');
await page.setViewportSize({ width: 1440, height: 900 });
await page.screenshot({ path: `${evidence}/home-desktop-cold.png`, fullPage: true });

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${base}/?demo=1`, { waitUntil: 'networkidle' });
await offlinePage.evaluate(() => navigator.serviceWorker.ready);
await offlinePage.reload({ waitUntil: 'networkidle' });
await offlineContext.setOffline(true);
await offlinePage.reload({ waitUntil: 'domcontentloaded' });
check(await offlinePage.locator('#demo-banner').isVisible(), 'offline demo banner is absent');
check(await offlinePage.locator('#receipt').isVisible(), 'offline demo receipt is absent');
report.offline = { title: await offlinePage.title(), receipt: await offlinePage.locator('#coverage-score').innerText() };
await offlineContext.setOffline(false);
await offlineContext.close();

check(report.errors.length === 0, `console errors: ${report.errors.join(' | ')}`);
await context.close();
await browser.close();
await writeFile(`${evidence}/report.json`, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
