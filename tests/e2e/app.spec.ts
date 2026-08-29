import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function chooseVirtualFolder(page: import('@playwright/test').Page, selector: string, folder: string, files: Array<{ path: string; body: string }>) {
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

test('core receipt flow works at mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('h1')).toHaveCount(1);

  await chooseVirtualFolder(page, '#source-input', 'DCIM', [
    { path: 'Camera/one.jpg', body: 'same photo bytes' },
    { path: 'Camera/two.jpg', body: 'original photo bytes' }
  ]);
  await expect(page.locator('#source-status')).toContainText('2 files');

  await chooseVirtualFolder(page, '#destination-input', 'DCIM-copy', [
    { path: 'Camera/one.jpg', body: 'same photo bytes' },
    { path: 'Camera/two.jpg', body: 'changed bytes' }
  ]);
  await expect(page.locator('#ready-panel')).toBeVisible();
  await page.locator('#compare-button').click();
  await expect(page.locator('#receipt')).toBeVisible();
  await expect(page.locator('#accounted-count')).toHaveText('1');
  await expect(page.locator('#changed-count')).toHaveText('1');
  await expect(page.locator('#receipt-conclusion')).toContainText('Do not wipe');
  await page.reload();
  await expect(page.locator('#ready-panel')).toBeVisible();
  await expect(page.locator('#source-status')).toContainText('restored local inventory');
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations).toEqual([]);
});

test('folder controls retain the browser fallback and mobile targets meet the touch baseline', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const chooser = page.waitForEvent('filechooser');
  await page.locator('#source-picker').click();
  await chooser;

  for (const selector of ['.wordmark', 'footer a']) {
    const targets = await page.locator(selector).all();
    for (const target of targets) {
      const box = await target.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test('installed shell reloads while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(300);
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.locator('#offline-banner')).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Check an Android backup');
  await context.setOffline(false);
});

test('@claim:demo-sample-receipt loads a useful four-file check from the one-click demo entry point', async ({ page }) => {
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Android Backup Receipt');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#receipt')).toBeVisible();
  await expect(page.locator('#ready-summary')).toContainText('4 source files vs 4 destination files');
  await expect(page.locator('#accounted-count')).toHaveText('2');
  await expect(page.locator('#missing-count')).toHaveText('1');
  await expect(page.locator('#changed-count')).toHaveText('1');
  await expect(page.locator('#coverage-score')).toHaveText('50%');
  await expect(page.locator('#receipt-conclusion')).toContainText('Do not wipe');
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('demo:android-backup-receipt');
  expect(databases).not.toContain('android-backup-receipt');
  const accessibility = await new AxeBuilder({ page: page as never }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('keyboard users can skip to the demo check and operate its reset control', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.locator('#reset-demo').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#receipt')).toBeVisible();
});

test('@claim:local-only-files keeps the demo check on the product origin', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
  await page.goto('/demo');
  await expect(page.locator('#receipt')).toBeVisible();
  expect(externalRequests).toEqual([]);
});

test('@claim:receipt-exports @claim:sha256-evidence creates observable JSON, CSV, and SHA-256 evidence from demo data', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#receipt')).toBeVisible();
  const receiptPromise = page.waitForEvent('download');
  await page.locator('#export-receipt').click();
  const receipt = await receiptPromise;
  const receiptPath = await receipt.path();
  expect(receiptPath).toBeTruthy();
  const receiptJson = JSON.parse(await readFile(receiptPath!, 'utf8')) as { schema: string; missing: number; changed: number };
  expect(receiptJson).toMatchObject({ schema: 'backup-receipt/result-1', missing: 1, changed: 1 });

  const csvPromise = page.waitForEvent('download');
  await page.locator('#export-csv').click();
  const csv = await csvPromise;
  const csvPath = await csv.path();
  expect(csvPath).toBeTruthy();
  const csvText = await readFile(csvPath!, 'utf8');
  expect(csvText).toContain('status,category,path,size_bytes');
  expect(csvText).toContain('changed');
  expect(csvText).toContain('missing');

  const sourceManifestPromise = page.waitForEvent('download');
  await page.locator('#export-source-manifest').click();
  const sourceManifest = await sourceManifestPromise;
  const sourceManifestPath = await sourceManifest.path();
  const sourceData = JSON.parse(await readFile(sourceManifestPath!, 'utf8')) as { files: Array<{ hashMethod: string }> };
  expect(sourceData.files).toHaveLength(4);
  expect(sourceData.files.every((file) => file.hashMethod === 'sha256')).toBe(true);
});

test('@claim:offline-reload reloads the demo after its first visit while offline', async ({ page, context }) => {
  // Clean the shared-origin worker/cache before this fresh-context claim. This
  // mirrors a first visit even when a prior local test run left an old worker.
  await page.goto('/');
  await page.evaluate(async () => {
    await Promise.all((await navigator.serviceWorker.getRegistrations()).map((registration) => registration.unregister()));
    await Promise.all((await caches.keys()).map((name) => caches.delete(name)));
  });
  // Navigate through a non-app document so an unregistered controller is
  // released before the fresh demo page registers the current worker.
  await page.goto('/online-check.txt');
  await page.goto('/?demo=1');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(300);
  // Let the now-active worker make one online demo navigation before asking it
  // for the cached offline shell.
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#demo-banner')).toBeVisible();
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\?demo=1/);
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#receipt')).toBeVisible();
  await context.setOffline(false);
});
