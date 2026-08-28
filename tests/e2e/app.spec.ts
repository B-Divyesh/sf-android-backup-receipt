import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

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
  const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
  expect(serious).toEqual([]);
});

test('installed shell reloads while offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(300);
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.locator('#offline-banner')).toBeVisible();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toContainText('Know what made it');
  await context.setOffline(false);
});
