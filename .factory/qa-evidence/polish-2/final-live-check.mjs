import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = 'https://android-backup-receipt.sociobot.in';
const report = { routes: {}, axe: {}, requests: [], errors: [], demo: {}, back: {}, reset: {}, offline: {} };
const browser = await chromium.launch();

const routeContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const routePage = await routeContext.newPage();
routePage.on('request', (request) => {
  if (new URL(request.url()).origin !== base) report.requests.push(request.url());
});
routePage.on('pageerror', (error) => report.errors.push(String(error)));
const routes = [
  ['/', 'Android Backup Receipt — check a phone backup', `${base}/`],
  ['/demo', 'Demo — Android Backup Receipt', `${base}/demo`],
  ['/privacy/', 'Privacy — Android Backup Receipt', `${base}/privacy/`],
  ['/terms/', 'Terms — Android Backup Receipt', `${base}/terms/`],
  ['/offline.html', 'Offline — Android Backup Receipt', `${base}/offline.html`],
  ['/final-404-check', 'Page not found — Android Backup Receipt', `${base}/404.html`]
];
for (const [path, title, canonical] of routes) {
  const response = await routePage.goto(`${base}${path}`, { waitUntil: 'networkidle' });
  const data = await routePage.evaluate(() => ({
    title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.href,
    h1: document.querySelectorAll('h1').length,
    main: Boolean(document.querySelector('main')),
    lang: document.documentElement.lang,
    nav: document.querySelectorAll('header nav a').length,
    privacy: document.querySelectorAll('footer a[href="/privacy/"]').length,
    terms: document.querySelectorAll('footer a[href="/terms/"]').length,
    og: Boolean(document.querySelector('meta[property="og:title"]')),
    twitter: Boolean(document.querySelector('meta[name="twitter:title"]')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  report.routes[path] = { status: response?.status(), ...data };
  assert.equal(data.title, title);
  assert.equal(data.canonical, canonical);
  assert.deepEqual([data.h1, data.main, data.lang, data.nav, data.privacy, data.terms, data.og, data.twitter, data.overflow], [1, true, 'en', 3, 1, 1, true, true, 0]);
  const axe = await new AxeBuilder({ page: routePage }).analyze();
  report.axe[path] = axe.violations.map((violation) => violation.id);
  assert.equal(axe.violations.length, 0);
}
assert.equal(report.routes['/final-404-check'].status, 404);
await routePage.goto(`${base}/`, { waitUntil: 'networkidle' });
const home = (await routePage.locator('body').innerText()).replace(/\s+/g, ' ');
for (const copy of [
  'Check an Android backup before you wipe.',
  'Read what this does not check',
  'Choose the matching backup folder',
  'The Android app uses Android’s file picker. This website uses your browser’s folder picker.',
  'Folder checks, folder records, and receipt downloads are free.'
]) assert.ok(home.includes(copy));
assert.deepEqual(report.requests, []);
assert.deepEqual(report.errors, []);
await routeContext.close();

const demoContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const demoPage = await demoContext.newPage();
await demoPage.goto(`${base}/`, { waitUntil: 'networkidle' });
const facts = await demoPage.locator('.trust-strip').boundingBox();
assert.ok(facts && facts.y + facts.height <= 844);
await demoPage.locator('.hero-actions a[href="/demo"]').click();
await demoPage.waitForFunction(() => !document.querySelector('#receipt')?.hasAttribute('hidden'));
const receipt = await demoPage.locator('#receipt').boundingBox();
const actions = await Promise.all(['#export-receipt', '#export-csv'].map((selector) => demoPage.locator(selector).boundingBox()));
report.demo = {
  path: new URL(demoPage.url()).pathname,
  title: await demoPage.title(),
  focused: await demoPage.locator('h1').evaluate((node) => node === document.activeElement),
  warning: await demoPage.locator('#receipt-conclusion').innerText(),
  receipt,
  actions
};
assert.equal(report.demo.path, '/demo');
assert.equal(report.demo.title, 'Demo — Android Backup Receipt');
assert.equal(report.demo.focused, true);
assert.equal(report.demo.warning, 'Do not wipe your phone yet: 1 file is missing and 1 has changed.');
assert.ok(receipt && receipt.y + receipt.height <= 844);
assert.ok(actions.every((box) => box && box.y + box.height <= 844));
await demoPage.screenshot({ path: '.factory/qa-evidence/polish-2/live/final-demo-mobile.png' });
await demoPage.goBack({ waitUntil: 'networkidle' });
await demoPage.waitForFunction(() => document.activeElement === document.querySelector('h1'));
report.back = await demoPage.evaluate(() => ({
  path: location.pathname,
  title: document.title,
  h1: document.querySelector('h1')?.textContent?.replace(/\s+/g, ' ').trim(),
  demo: document.documentElement.dataset.demo,
  bannerHidden: document.querySelector('#demo-banner')?.hasAttribute('hidden'),
  receiptHidden: document.querySelector('#receipt')?.hasAttribute('hidden'),
  announcement: document.querySelector('#route-announcement')?.textContent,
  focused: document.activeElement === document.querySelector('h1')
}));
assert.deepEqual(report.back, {
  path: '/', title: 'Android Backup Receipt — check a phone backup', h1: 'Check an Android backup before you wipe.',
  demo: 'false', bannerHidden: true, receiptHidden: true,
  announcement: 'Android Backup Receipt — check a phone backup', focused: true
});
await demoPage.goto(`${base}/demo`);
await demoPage.waitForFunction(() => !document.querySelector('#receipt')?.hasAttribute('hidden'));
await demoPage.evaluate(async () => {
  localStorage.setItem('demo:license', 'demo');
  localStorage.setItem('sb_license:android-backup-receipt', 'real');
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('demo:android-backup-receipt', 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const transaction = database.transaction('history', 'readwrite');
  transaction.objectStore('history').put({ checkedAt: 'final' });
  await new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
});
await demoPage.locator('#reset-demo').click();
await demoPage.waitForFunction(() => document.querySelector('#toast-text')?.textContent?.includes('cleared'));
report.reset.afterReset = await demoPage.evaluate(async () => {
  const database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('demo:android-backup-receipt', 2);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const count = (store) => new Promise((resolve, reject) => {
    const request = database.transaction(store, 'readonly').objectStore(store).count();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const result = { active: await count('active'), history: await count('history'), demoKeys: Object.keys(localStorage).filter((key) => key.startsWith('demo:')), real: localStorage.getItem('sb_license:android-backup-receipt') };
  database.close();
  return result;
});
assert.deepEqual(report.reset.afterReset, { active: 2, history: 0, demoKeys: [], real: 'real' });
await demoPage.evaluate(() => localStorage.setItem('demo:license', 'demo'));
await demoPage.locator('#start-real').click();
await demoPage.waitForURL(`${base}/`);
report.reset.afterExit = await demoPage.evaluate(async () => ({
  demoDatabase: (await indexedDB.databases()).some((database) => database.name === 'demo:android-backup-receipt'),
  demoKeys: Object.keys(localStorage).filter((key) => key.startsWith('demo:')),
  real: localStorage.getItem('sb_license:android-backup-receipt')
}));
assert.deepEqual(report.reset.afterExit, { demoDatabase: false, demoKeys: [], real: 'real' });
await demoContext.close();

const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
const offlinePage = await offlineContext.newPage();
await offlinePage.goto(`${base}/?demo=1`);
await offlinePage.evaluate(() => navigator.serviceWorker.ready);
await offlinePage.waitForTimeout(500);
const appSource = await offlinePage.evaluate(async () => {
  const url = document.querySelector('script[type="module"]')?.src;
  return url ? fetch(url).then((response) => response.text()) : '';
});
assert.doesNotMatch(appSource, /verification will resume online|License checks resume when connected/);
await offlinePage.reload({ waitUntil: 'domcontentloaded' });
await offlineContext.setOffline(true);
await offlinePage.evaluate(() => window.dispatchEvent(new Event('offline')));
await offlinePage.reload({ waitUntil: 'domcontentloaded' });
await offlinePage.waitForFunction(() => !document.querySelector('#receipt')?.hasAttribute('hidden'));
for (const selector of ['#export-receipt', '#export-csv']) {
  const download = offlinePage.waitForEvent('download');
  await offlinePage.locator(selector).click();
  assert.ok(await (await download).path());
}
report.offline = { banner: await offlinePage.locator('#offline-banner').isVisible(), receipt: await offlinePage.locator('#receipt').isVisible(), downloads: 2, reconnectionPromiseAbsent: true };
await offlineContext.setOffline(false);
await offlineContext.close();
await browser.close();
await writeFile('.factory/qa-evidence/polish-2/live/final-cold-check.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
