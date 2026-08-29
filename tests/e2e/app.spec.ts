import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createHash } from 'node:crypto';
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

function repeatedFixtureDigest(size: number, seed: string): string {
  const digest = createHash('sha256');
  const bytes = Buffer.from(seed);
  for (let remaining = size; remaining > 0;) {
    const part = bytes.subarray(0, Math.min(remaining, bytes.length));
    digest.update(part);
    remaining -= part.length;
  }
  return digest.digest('hex');
}

test('@claim:resume-reset restores an interrupted check and clears it on request', async ({ page }) => {
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
  await expect(page.locator('#receipt-conclusion')).toHaveText('Do not wipe your phone yet: 1 has changed.');
  await page.reload();
  await expect(page.locator('#ready-panel')).toBeVisible();
  await expect(page.locator('#source-status')).toContainText('restored phone folder');
  await page.locator('#compare-button').click();
  await page.locator('#new-check').click();
  await expect(page.locator('#source-status')).toHaveText('No phone folder selected');
  await expect(page.locator('#destination-status')).toHaveText('No backup folder selected');
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('android-backup-receipt');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = database.transaction('active', 'readonly').objectStore('active').count();
    const value = await new Promise<number>((resolve, reject) => {
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => reject(count.error);
    });
    database.close();
    return value;
  })).toBe(0);
});

test('has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations).toEqual([]);
});

test('@claim:responsive-keyboard keeps the first-screen facts and controls usable at 390 px with a keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const desktopFacts = await page.locator('.trust-strip').boundingBox();
  expect((desktopFacts?.y ?? 901) + (desktopFacts?.height ?? 901)).toBeLessThanOrEqual(900);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const facts = await page.locator('.trust-strip').boundingBox();
  expect(facts?.y).toBeGreaterThanOrEqual(0);
  expect((facts?.y ?? 900) + (facts?.height ?? 900)).toBeLessThanOrEqual(844);
  await expect(page.locator('.action-outcome')).toHaveText('Opens a four-file receipt with two problems.');
  await expect(page.locator('.trust-strip')).toContainText('Files stay on this device');
  await expect(page.locator('.trust-strip')).toContainText('Offline after the first visit');
  await expect(page.locator('.trust-strip')).toContainText('Checks are free history costs $7 once');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();

  const chooser = page.waitForEvent('filechooser');
  await page.locator('#source-picker').focus();
  await page.keyboard.press('Enter');
  await chooser;

  for (const selector of ['.wordmark', 'footer a', '.checksum-link', '#manifest-input', '.license-box label']) {
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

test('@claim:demo-sample-receipt loads a useful four-file receipt inside the first mobile screen', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/online-check.txt');
  await page.evaluate(async () => {
    localStorage.setItem('sb_license:android-backup-receipt', 'real-license-sentinel');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('android-backup-receipt', 2);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('active')) request.result.createObjectStore('active', { keyPath: 'kind' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction('active', 'readwrite');
    transaction.objectStore('active').put({ kind: 'source', inventory: { label: 'REAL SENTINEL' } });
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
  await page.goto('/');
  await page.locator('.hero-actions a[href="/demo"]').click();
  await expect(page).toHaveURL('/demo');
  await expect(page).toHaveTitle('Demo — Android Backup Receipt');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#receipt')).toBeVisible();
  await expect(page.locator('#ready-summary')).toContainText('4 phone files vs 4 backup files');
  await expect(page.locator('#accounted-count')).toHaveText('2');
  await expect(page.locator('#missing-count')).toHaveText('1');
  await expect(page.locator('#changed-count')).toHaveText('1');
  await expect(page.locator('#coverage-score')).toHaveText('50%');
  await expect(page.locator('#receipt-conclusion')).toHaveText('Do not wipe your phone yet: 1 file is missing and 1 has changed.');
  await expect(page.locator('h1')).toBeFocused();
  for (const selector of ['#receipt', '#accounted-count', '#missing-count', '#changed-count', '.issue-list', '#export-receipt', '#export-csv']) {
    const box = await page.locator(selector).boundingBox();
    expect(box?.y).toBeGreaterThanOrEqual(0);
    expect((box?.y ?? 845) + (box?.height ?? 845)).toBeLessThanOrEqual(844);
  }
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('demo:android-backup-receipt');
  expect(databases).toContain('android-backup-receipt');
  expect(await page.evaluate(() => localStorage.getItem('sb_license:android-backup-receipt'))).toBe('real-license-sentinel');
  expect(await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('android-backup-receipt');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const request = database.transaction('active', 'readonly').objectStore('active').get('source');
    const value = await new Promise<{ inventory: { label: string } }>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return value.inventory.label;
  })).toBe('REAL SENTINEL');
  const accessibility = await new AxeBuilder({ page: page as never }).analyze();
  expect(accessibility.violations).toEqual([]);
});

test('@claim:demo-reset-isolation resets and exits the complete sandbox without changing real data', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('#receipt')).toBeVisible();
  await page.evaluate(async () => {
    localStorage.setItem('demo:sb_license:android-backup-receipt', 'demo-license');
    localStorage.setItem('demo:sb_license_verdict:android-backup-receipt', '{"valid":true}');
    localStorage.setItem('demo:android-backup-receipt:extra', 'demo-extra');
    localStorage.setItem('sb_license:android-backup-receipt', 'real-license');
    const seedHistory = (name: string, checkedAt: string) => new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(name, 2);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains('active')) request.result.createObjectStore('active', { keyPath: 'kind' });
        if (!request.result.objectStoreNames.contains('history')) request.result.createObjectStore('history', { keyPath: 'checkedAt' });
      };
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('history', 'readwrite');
        transaction.objectStore('history').put({ checkedAt, sourceLabel: name });
        transaction.oncomplete = () => { database.close(); resolve(); };
        transaction.onerror = () => { database.close(); reject(transaction.error); };
      };
    });
    await seedHistory('demo:android-backup-receipt', '2026-08-29T10:00:00.000Z');
    await seedHistory('android-backup-receipt', '2026-08-29T11:00:00.000Z');
  });

  await page.locator('#reset-demo').click();
  await expect(page.locator('#toast-text')).toContainText('Demo history and license data were cleared');
  await expect(page.locator('#coverage-score')).toHaveText('50%');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:')))).toEqual([]);
  expect(await page.evaluate(async () => {
    const request = indexedDB.open('demo:android-backup-receipt', 2);
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = (store: 'active' | 'history') => new Promise<number>((resolve, reject) => {
      const result = database.transaction(store, 'readonly').objectStore(store).count();
      result.onsuccess = () => resolve(result.result);
      result.onerror = () => reject(result.error);
    });
    const value = { active: await count('active'), history: await count('history') };
    database.close();
    return value;
  })).toEqual({ active: 2, history: 0 });
  expect(await page.evaluate(() => localStorage.getItem('sb_license:android-backup-receipt'))).toBe('real-license');

  await page.evaluate(async () => {
    localStorage.setItem('demo:sb_license:android-backup-receipt', 'demo-license-again');
    localStorage.setItem('demo:android-backup-receipt:extra', 'demo-extra-again');
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:android-backup-receipt', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const transaction = database.transaction('history', 'readwrite');
    transaction.objectStore('history').put({ checkedAt: '2026-08-29T12:00:00.000Z' });
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  });
  await page.locator('#start-real').click();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle('Android Backup Receipt — check a phone backup');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('demo:')))).toEqual([]);
  expect(await page.evaluate(async () => (await indexedDB.databases()).some((database) => database.name === 'demo:android-backup-receipt'))).toBe(false);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:android-backup-receipt'))).toBe('real-license');
  expect(await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('android-backup-receipt', 2);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const request = database.transaction('history', 'readonly').objectStore('history').count();
    const count = await new Promise<number>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return count;
  })).toBe(1);
});

test('@claim:multi-folder-receipt combines several folder pairs and preserves per-pair results', async ({ page }) => {
  await page.goto('/');
  await chooseVirtualFolder(page, '#source-input', 'DCIM', [
    { path: 'Camera/one.jpg', body: 'photo one' },
    { path: 'Camera/two.jpg', body: 'photo two' }
  ]);
  await chooseVirtualFolder(page, '#destination-input', 'DCIM-backup', [
    { path: 'Camera/one.jpg', body: 'photo one' },
    { path: 'Camera/two.jpg', body: 'changed photo' }
  ]);
  await page.locator('#add-pair').click();
  await expect(page.locator('#pair-list li')).toHaveCount(1);
  await page.reload();
  await expect(page.locator('#pair-list li')).toHaveCount(1);

  await chooseVirtualFolder(page, '#source-input', 'Documents', [
    { path: 'notes.txt', body: 'move notes' }
  ]);
  await chooseVirtualFolder(page, '#destination-input', 'Documents-backup', [
    { path: 'notes.txt', body: 'move notes' },
    { path: 'extra.txt', body: 'extra' }
  ]);
  await page.locator('#compare-button').click();
  await expect(page.locator('#pair-results .pair-result')).toHaveCount(2);
  await expect(page.locator('#accounted-count')).toHaveText('2');
  await expect(page.locator('#changed-count')).toHaveText('1');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-receipt').click();
  const path = await (await downloadPromise).path();
  const receipt = JSON.parse(await readFile(path!, 'utf8')) as { pairs: unknown[]; total: number; accounted: number; changed: number; extra: number };
  expect(receipt).toMatchObject({ total: 3, accounted: 2, changed: 1, extra: 1 });
  expect(receipt.pairs).toHaveLength(2);
});

test('keyboard users can skip to the demo check and operate its reset control', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('h1')).toBeFocused();
  await page.locator('.skip-link').focus();
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

test('@claim:no-tracking-runtime loads every public page without analytics, ads, remote fonts, or third-party runtime scripts', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
  const loadedSource: string[] = [];
  for (const route of ['/', '/demo', '/privacy/', '/terms/', '/offline.html', '/404.html']) {
    await page.goto(route);
    const resources = await page.evaluate(async () => {
      const urls = [
        location.href,
        ...Array.from(document.scripts, (script) => script.src).filter(Boolean),
        ...Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'), (link) => link.href)
      ];
      const externalRuntime = urls.filter((url) => new URL(url).origin !== location.origin);
      const source = await Promise.all(urls.map((url) => fetch(url).then((response) => response.text())));
      const remoteFontRules = Array.from(document.styleSheets).flatMap((sheet) => {
        try { return Array.from(sheet.cssRules, (rule) => rule.cssText); } catch { return ['unreadable cross-origin stylesheet']; }
      }).filter((rule) => /@font-face/i.test(rule) && /https?:\/\//i.test(rule));
      return { externalRuntime, remoteFontRules, source };
    });
    expect(resources.externalRuntime).toEqual([]);
    expect(resources.remoteFontRules).toEqual([]);
    loadedSource.push(...resources.source);
  }
  expect(externalRequests).toEqual([]);
  const runtime = loadedSource.join('\n');
  expect(runtime).not.toMatch(/googletagmanager|google-analytics\.com|doubleclick\.net|adsbygoogle|connect\.facebook\.net|static\.hotjar\.com|cdn\.segment\.com|cdn\.mxpnl\.com|posthog\.com|fonts\.googleapis\.com|fonts\.gstatic\.com/i);
});

test('@claim:receipt-exports creates observable JSON and CSV exports from demo data', async ({ page }) => {
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

});

test('@claim:sha256-evidence exports complete, reproducible SHA-256 evidence for every demo source file', async ({ page }) => {
  await page.goto('/demo');
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#export-source-manifest').click();
  const download = await downloadPromise;
  const path = await download.path();
  const source = JSON.parse(await readFile(path!, 'utf8')) as { files: Array<{ path: string; size: number; hash: string; hashMethod: string }> };
  const fixtures = new Map([
    ['Camera/IMG_20260817_0912.jpg', 'sample-photo-0912\n'],
    ['Camera/IMG_20260817_1003.jpg', 'sample-photo-1003\n'],
    ['Documents/phone-transfer-notes.pdf', 'sample-transfer-notes\n'],
    ['Exports/Signal-2026-08-17.backup', 'sample-signal-export\n']
  ]);
  expect(source.files).toHaveLength(4);
  for (const file of source.files) {
    expect(file.hashMethod).toBe('sha256');
    expect(file.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(file.hash).toBe(repeatedFixtureDigest(file.size, fixtures.get(file.path)!));
  }
});

test('@claim:comparison-manifest reports every comparison class and accepts an exported manifest', async ({ page }) => {
  await page.goto('/demo');
  const receiptPromise = page.waitForEvent('download');
  await page.locator('#export-receipt').click();
  const receiptPath = await (await receiptPromise).path();
  const result = JSON.parse(await readFile(receiptPath!, 'utf8')) as { accounted: number; missing: number; changed: number; extra: number; categories: unknown[] };
  expect(result).toMatchObject({ accounted: 2, missing: 1, changed: 1, extra: 1 });
  expect(result.categories.length).toBeGreaterThan(1);

  const manifestPromise = page.waitForEvent('download');
  await page.locator('#export-source-manifest').click();
  const manifestPath = await (await manifestPromise).path();
  await page.locator('#manifest-input').setInputFiles(manifestPath!);
  await expect(page.locator('#destination-status')).toContainText('saved record / 4 files');
  await page.locator('#compare-button').click();
  await expect(page.locator('#coverage-score')).toHaveText('100%');
  await expect(page.locator('#missing-count')).toHaveText('0');
  await expect(page.locator('#changed-count')).toHaveText('0');
});

test('@claim:print-view sends the completed demo receipt to the browser print view', async ({ page }) => {
  await page.goto('/demo');
  await page.evaluate(() => {
    window.print = () => { document.documentElement.dataset.printRequested = 'true'; };
  });
  await page.locator('#print-receipt').click();
  await expect(page.locator('html')).toHaveAttribute('data-print-requested', 'true');
  await page.emulateMedia({ media: 'print' });
  expect(await page.locator('#receipt').evaluate((receipt) => getComputedStyle(receipt).display)).not.toBe('none');
});

test('@claim:local-metadata-storage keeps only inventory evidence in the isolated demo database', async ({ page }) => {
  await page.goto('/demo');
  await expect.poll(() => page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:android-backup-receipt');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = database.transaction('active', 'readonly').objectStore('active').count();
    const value = await new Promise<number>((resolve, reject) => {
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => reject(count.error);
    });
    database.close();
    return value;
  })).toBe(2);
  const records = await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:android-backup-receipt');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const request = database.transaction('active', 'readonly').objectStore('active').getAll();
    const values = await new Promise<unknown[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return values;
  }) as Array<{ inventory: { files: Array<Record<string, unknown>> } }>;
  expect(records).toHaveLength(2);
  for (const record of records) {
    for (const file of record.inventory.files) {
      expect(Object.keys(file).sort()).toEqual(['hash', 'hashMethod', 'modified', 'path', 'size']);
      expect(file).not.toHaveProperty('content');
      expect(file).not.toHaveProperty('exif');
    }
  }
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
});

test('@claim:migration-archive verifies only with Sociobot and caps the $7 one-time archive at 20 local receipts', async ({ page }) => {
  const externalRequests: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') externalRequests.push(request.url());
  });
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    const billingRequests: string[] = [];
    Object.defineProperty(window, '__billingRequests', { value: billingRequests });
    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.startsWith('https://api.sociobot.in/')) {
        billingRequests.push(url);
        return Promise.resolve(new Response('{"valid":true,"reason":"ok"}', { status: 200, headers: { 'content-type': 'application/json' } }));
      }
      return originalFetch(input, init);
    };
  });
  await page.goto('/demo');
  await expect(page.locator('#unlock')).toContainText('$7 Migration Kit');
  await expect(page.locator('#unlock')).toContainText('one-time purchase');
  await expect(page.locator('#unlock')).toContainText('No subscription');
  await expect(page.locator('#unlock > .license-box > a')).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/android-backup-receipt/checkout');
  await page.locator('#license-input').fill('sbk_test_fixture_license');
  await page.locator('#license-form button').click();
  await expect(page.locator('#license-status')).toContainText('active');
  for (let index = 1; index <= 21; index += 1) {
    await page.waitForTimeout(2);
    await page.locator('#compare-button').click();
    await expect(page.locator('#history-list li')).toHaveCount(Math.min(index, 20));
  }
  await page.waitForTimeout(100);
  expect(await page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('demo:android-backup-receipt');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const count = database.transaction('history', 'readonly').objectStore('history').count();
    const value = await new Promise<number>((resolve, reject) => {
      count.onsuccess = () => resolve(count.result);
      count.onerror = () => reject(count.error);
    });
    database.close();
    return value;
  })).toBe(20);
  expect(externalRequests).toEqual([]);
  const billingRequests = await page.evaluate(() => (window as typeof window & { __billingRequests: string[] }).__billingRequests);
  expect(billingRequests).toHaveLength(1);
  expect(billingRequests[0]).toMatch(/^https:\/\/api\.sociobot\.in\/api\/v1\/products\/android-backup-receipt\/verify\?license=/);
  expect(await page.evaluate(() => Object.keys(localStorage).sort())).toEqual([
    'demo:sb_license:android-backup-receipt',
    'demo:sb_license_verdict:android-backup-receipt'
  ]);
});

test('@claim:license-revocation keeps receipt history unavailable for expired, revoked, and wrong-product licenses while named free outputs work', async ({ browser }) => {
  for (const reason of ['expired', 'revoked', 'wrong_product']) {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.addInitScript((recordedReason) => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (url.startsWith('https://api.sociobot.in/')) {
          return Promise.resolve(new Response(JSON.stringify({ valid: false, reason: recordedReason }), { status: 200, headers: { 'content-type': 'application/json' } }));
        }
        return originalFetch(input, init);
      };
    }, reason);
    await page.goto(`/demo?license=${reason}_fixture_token`);
    await expect(page).not.toHaveURL(/license=/);
    await expect(page.locator('#license-status')).toContainText('License no longer active');
    await expect(page.locator('#history-panel')).toBeHidden();
    await expect(page.locator('#receipt')).toBeVisible();
    await expect(page.locator('#compare-button')).toBeEnabled();
    if (reason === 'revoked') {
      await page.locator('#compare-button').click();
      for (const selector of ['#export-source-manifest', '#export-destination-manifest', '#export-receipt', '#export-csv']) {
        await expect(page.locator(selector)).toBeEnabled();
        const downloadPromise = page.waitForEvent('download');
        await page.locator(selector).click();
        expect(await (await downloadPromise).path()).toBeTruthy();
      }
      await page.evaluate(() => {
        window.print = () => { document.documentElement.dataset.printRequested = 'true'; };
      });
      await page.locator('#print-receipt').click();
      await expect(page.locator('html')).toHaveAttribute('data-print-requested', 'true');
    }
    await context.close();
  }
});

test('malformed manifest errors use plain recovery guidance', async ({ page }) => {
  await page.goto('/demo');
  await page.locator('#manifest-input').setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{bad') });
  await expect(page.locator('#destination-status')).toHaveText('That file is not a valid folder record. Choose one downloaded from this app.');
  await expect(page.locator('#destination-status')).not.toContainText('position');
});

test('ships route-specific metadata, consistent navigation, focus, and build identity', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /receipt-og-1200x630/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('sizes', '180x180');
  await expect(page.locator('footer')).toContainText('Built by Param Factory');
  await expect(page.locator('footer')).not.toContainText('__BUILD_ID__');
  await page.locator('.hero-actions a[href="/demo"]').click();
  await expect(page).toHaveTitle('Demo — Android Backup Receipt');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://android-backup-receipt.sociobot.in/demo');
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://android-backup-receipt.sociobot.in/demo');
  await expect(page.locator('h1')).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page).toHaveTitle('Android Backup Receipt — check a phone backup');
  await expect(page.locator('h1')).toHaveText(/Check an Android backup/);
  await expect(page.locator('#demo-banner')).toBeHidden();
  await expect(page.locator('#receipt')).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute('data-demo', 'false');
  await expect(page.locator('#route-announcement')).toHaveText('Android Backup Receipt — check a phone backup');
  await expect(page.locator('h1')).toBeFocused();
  for (const route of ['/privacy/', '/terms/', '/offline.html', '/404.html']) {
    await page.goto(route);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[name="twitter:title"]')).toHaveCount(1);
    await expect(page.locator('header nav a')).toHaveCount(3);
    await expect(page.locator('footer a[href="/privacy/"]')).toHaveCount(1);
    await expect(page.locator('footer a[href="/terms/"]')).toHaveCount(1);
    await expect(page.locator('footer')).toContainText('Built by Param Factory');
    await expect(page.locator('h1')).toBeFocused();
    const accessibility = await new AxeBuilder({ page: page as never }).analyze();
    expect(accessibility.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);
  }
});

test('@claim:offline-reload is installable and reloads the demo after its first visit while offline', async ({ page, context }) => {
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
  const manifest = await page.evaluate(async () => fetch('/manifest.webmanifest').then((response) => response.json())) as { display: string; icons: Array<{ sizes: string; purpose?: string }> };
  expect(manifest.display).toBe('standalone');
  expect(manifest.icons.some((icon) => icon.sizes === '192x192')).toBe(true);
  expect(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable')).toBe(true);
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

test('@claim:offline-exports runs the check and downloads both receipt files while offline', async ({ page, context }) => {
  expect(await readFile('src/main.ts', 'utf8')).not.toMatch(/verification will resume online|License checks resume when connected/);
  await page.goto('/?demo=1');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(300);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await context.setOffline(true);
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await page.locator('#compare-button').click();
  await expect(page.locator('#coverage-score')).toHaveText('50%');
  for (const selector of ['#export-receipt', '#export-csv']) {
    const downloadPromise = page.waitForEvent('download');
    await page.locator(selector).click();
    expect(await (await downloadPromise).path()).toBeTruthy();
  }
  await context.setOffline(false);
});
