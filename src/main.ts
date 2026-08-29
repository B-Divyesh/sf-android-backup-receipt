import './style.css';
import {
  buildInventory,
  compareInventories,
  comparisonCsv,
  folderLabel,
  formatBytes,
  MANIFEST_SCHEMA,
  parseManifest,
  type Comparison,
  type Inventory
} from './core.ts';
import { cancelSafScan, chooseSafTree, listenForSafProgress, usesNativeSaf } from './native-saf.ts';

const PRODUCT_SLUG = 'android-backup-receipt';
const BILLING_BASE = 'https://api.sociobot.in/api/v1';
const navigationUrl = performance.getEntriesByType('navigation')[0]?.name || location.href;
const navigationPath = new URL(navigationUrl, location.origin).pathname;
// A service worker may return the cached app shell for /demo while preserving
// the browser's navigation entry. Keep demo identity from that entry offline.
const demoMode = location.pathname === '/demo' || location.pathname === '/demo/' || location.pathname === '/demo.html' || navigationPath === '/demo' || navigationPath === '/demo/' || navigationPath === '/demo.html' || new URLSearchParams(location.search).get('demo') === '1';
const storagePrefix = demoMode ? 'demo:' : '';
const LICENSE_KEY = `${storagePrefix}sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `${storagePrefix}sb_license_verdict:${PRODUCT_SLUG}`;
const DATABASE_NAME = `${storagePrefix}${PRODUCT_SLUG}`;
const DAY = 86_400_000;

document.documentElement.dataset.demo = String(demoMode);
if (demoMode) document.title = 'Demo — Android Backup Receipt';

const demoSource: Inventory = {
  schema: MANIFEST_SCHEMA,
  label: 'Pixel 7 / DCIM + exports',
  createdAt: '2026-08-29T09:00:00.000Z',
  files: [
    // These are complete SHA-256 digests of deterministic virtual fixture
    // streams. Each stream repeats its path-specific seed to the stated size.
    { path: 'Camera/IMG_20260817_0912.jpg', size: 2_481_640, modified: 1, hash: 'cc9b0766eaea3d8899a98f78fc34b4725ad8821754ccb2fff396ab9811c5df06', hashMethod: 'sha256' },
    { path: 'Camera/IMG_20260817_1003.jpg', size: 2_178_532, modified: 2, hash: '5c649bd0f8fad31c86668d4f3d9eb31a40907130eac9bf06001cacd31447e7f2', hashMethod: 'sha256' },
    { path: 'Documents/phone-transfer-notes.pdf', size: 184_320, modified: 3, hash: 'b0215f905cfcecd40bbd7639ed11d68298009f67f5887c5e09a5af69017fd148', hashMethod: 'sha256' },
    { path: 'Exports/Signal-2026-08-17.backup', size: 8_765_441, modified: 4, hash: 'cb08e73f26815ff2290e84a8b6fe6033c881acabac792dd7f3c9ad0cc6b027b6', hashMethod: 'sha256' }
  ]
};

const demoDestination: Inventory = {
  schema: MANIFEST_SCHEMA,
  label: 'USB-C backup drive',
  createdAt: '2026-08-29T09:01:00.000Z',
  files: [
    { ...demoSource.files[0] },
    { ...demoSource.files[1], hash: 'cdd35de98e33e5c102225f651b4a6df49de5fbf6e72e59f9d9b28140819751ab' },
    { ...demoSource.files[3] },
    { path: 'Download/read-me-first.txt', size: 912, modified: 5, hash: '0aa9496a8747cb0d0e069dc5a871e66c9c684e5bff7ecf9fc15f6b83f77d7e02', hashMethod: 'sha256' }
  ]
};

function element<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Missing required element: ${id}`);
  return found as T;
}

const sourceInput = element<HTMLInputElement>('source-input');
const destinationInput = element<HTMLInputElement>('destination-input');
const manifestInput = element<HTMLInputElement>('manifest-input');
const sourcePicker = element<HTMLButtonElement>('source-picker');
const destinationPicker = element<HTMLButtonElement>('destination-picker');
const sourceStatus = element<HTMLDivElement>('source-status');
const destinationStatus = element<HTMLDivElement>('destination-status');
const sourceCard = element<HTMLElement>('source-card');
const destinationCard = element<HTMLElement>('destination-card');
const scanPanel = element<HTMLDivElement>('scan-panel');
const scanLabel = element<HTMLElement>('scan-label');
const scanCount = element<HTMLElement>('scan-count');
const scanFile = element<HTMLElement>('scan-file');
const progressBar = element<HTMLElement>('progress-bar');
const progressTrack = scanPanel.querySelector<HTMLElement>('[role="progressbar"]')!;
const readyPanel = element<HTMLDivElement>('ready-panel');
const readySummary = element<HTMLElement>('ready-summary');
const compareButton = element<HTMLButtonElement>('compare-button');
const emptyGuidance = element<HTMLDivElement>('empty-guidance');
const receiptElement = element<HTMLElement>('receipt');
const exportSourceButton = element<HTMLButtonElement>('export-source-manifest');
const exportDestinationButton = element<HTMLButtonElement>('export-destination-manifest');

let sourceInventory: Inventory | null = null;
let destinationInventory: Inventory | null = null;
let comparison: Comparison | null = null;
let scanController: AbortController | null = null;
let isPremium = false;

function announce(message: string): void {
  const toast = element<HTMLDivElement>('toast');
  element<HTMLSpanElement>('toast-text').textContent = message;
  toast.hidden = false;
  window.setTimeout(() => { if (element<HTMLButtonElement>('update-button').hidden) toast.hidden = true; }, 5000);
}

function download(filename: string, content: string, type: string): void {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function safeFilename(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'folder';
}

function exportManifest(inventory: Inventory): void {
  download(`${safeFilename(inventory.label)}-backup-manifest.json`, JSON.stringify(inventory, null, 2), 'application/json');
  announce('Manifest exported. Keep it private: it contains filenames and fingerprints.');
}

function updateReadiness(): void {
  const source = sourceInventory;
  const destination = destinationInventory;
  const ready = source !== null && destination !== null;
  readyPanel.hidden = !ready;
  emptyGuidance.hidden = sourceInventory !== null || destinationInventory !== null;
  exportSourceButton.hidden = sourceInventory === null;
  exportDestinationButton.hidden = destinationInventory === null;
  if (ready && source && destination) {
    readySummary.textContent = `${source.files.length.toLocaleString()} source files vs ${destination.files.length.toLocaleString()} destination files`;
  }
}

function acceptInventory(kind: 'source' | 'destination', inventory: Inventory): void {
  const bytes = inventory.files.reduce((sum, file) => sum + file.size, 0);
  const status = kind === 'source' ? sourceStatus : destinationStatus;
  const card = kind === 'source' ? sourceCard : destinationCard;
  if (kind === 'source') sourceInventory = inventory;
  else destinationInventory = inventory;
  void saveActiveInventory(kind, inventory);
  status.textContent = `${inventory.label} / ${inventory.files.length.toLocaleString()} files / ${formatBytes(bytes)}`;
  card.classList.add('is-ready');
  scanPanel.hidden = true;
  updateReadiness();
}

function loadDemoData(): void {
  sourceInventory = structuredClone(demoSource);
  destinationInventory = structuredClone(demoDestination);
  acceptInventory('source', sourceInventory);
  acceptInventory('destination', destinationInventory);
  comparison = compareInventories(sourceInventory, destinationInventory, new Date('2026-08-29T09:02:00.000Z'));
  renderReceipt(comparison, false);
}

async function scanFiles(kind: 'source' | 'destination', files: FileList): Promise<void> {
  if (files.length === 0) {
    const status = kind === 'source' ? sourceStatus : destinationStatus;
    status.textContent = 'That folder contained no readable files. Choose another folder.';
    return;
  }
  scanController?.abort();
  scanController = new AbortController();
  const controller = scanController;
  const label = folderLabel(Array.from(files), kind === 'source' ? 'Source folder' : 'Destination folder');
  const status = kind === 'source' ? sourceStatus : destinationStatus;
  scanPanel.hidden = false;
  scanLabel.textContent = kind === 'source' ? 'Inventorying source…' : 'Inventorying destination…';
  status.textContent = `Reading ${files.length.toLocaleString()} files…`;

  try {
    const inventory = await buildInventory(Array.from(files), label, ({ current, total, path }) => {
      const percent = total === 0 ? 0 : Math.round((current / total) * 100);
      scanCount.textContent = `${current.toLocaleString()} / ${total.toLocaleString()}`;
      scanFile.textContent = path || 'Preparing inventory';
      progressBar.style.width = `${percent}%`;
      progressTrack.setAttribute('aria-valuenow', String(percent));
    }, controller.signal);
    if (controller !== scanController) return;
    acceptInventory(kind, inventory);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      status.textContent = 'Scan cancelled. Choose the folder again when ready.';
    } else {
      status.textContent = `Could not read this folder. ${error instanceof Error ? error.message : 'Try another folder.'}`;
    }
    scanPanel.hidden = true;
  }
}

async function scanSafTree(kind: 'source' | 'destination'): Promise<void> {
  const status = kind === 'source' ? sourceStatus : destinationStatus;
  scanPanel.hidden = false;
  scanLabel.textContent = kind === 'source' ? 'Waiting for Android folder permission…' : 'Waiting for Android destination permission…';
  scanCount.textContent = '0 / 0';
  scanFile.textContent = 'Choose a folder in Android’s file picker';
  progressBar.style.width = '0%';
  status.textContent = 'Android will only read the folder you select.';
  try {
    const inventory = await chooseSafTree(kind);
    acceptInventory(kind, inventory);
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Could not read this folder. Choose another folder.';
    scanPanel.hidden = true;
  }
}

sourceInput.addEventListener('change', () => {
  if (sourceInput.files) void scanFiles('source', sourceInput.files);
});
destinationInput.addEventListener('change', () => {
  if (destinationInput.files) void scanFiles('destination', destinationInput.files);
});
sourcePicker.addEventListener('click', () => {
  if (usesNativeSaf()) void scanSafTree('source');
  else sourceInput.click();
});
destinationPicker.addEventListener('click', () => {
  if (usesNativeSaf()) void scanSafTree('destination');
  else destinationInput.click();
});
manifestInput.addEventListener('change', async () => {
  const file = manifestInput.files?.[0];
  if (!file) return;
  try {
    let decoded: unknown;
    try {
      decoded = JSON.parse(await file.text());
    } catch {
      throw new Error('That file is not valid JSON. Choose a manifest exported from this app.');
    }
    destinationInventory = parseManifest(decoded);
    void saveActiveInventory('destination', destinationInventory);
    destinationStatus.textContent = `${destinationInventory.label} manifest / ${destinationInventory.files.length.toLocaleString()} files`;
    destinationCard.classList.add('is-ready');
    updateReadiness();
  } catch (error) {
    destinationInventory = null;
    destinationCard.classList.remove('is-ready');
    destinationStatus.textContent = error instanceof Error ? error.message : 'Could not read that manifest.';
    updateReadiness();
  }
});

element<HTMLButtonElement>('cancel-scan').addEventListener('click', () => {
  scanController?.abort();
  void cancelSafScan();
});
exportSourceButton.addEventListener('click', () => { if (sourceInventory) exportManifest(sourceInventory); });
exportDestinationButton.addEventListener('click', () => { if (destinationInventory) exportManifest(destinationInventory); });

function renderReceipt(result: Comparison, scroll = true): void {
  element<HTMLElement>('receipt-meta').textContent = `${new Date(result.checkedAt).toLocaleString()} / ${result.sourceLabel} → ${result.destinationLabel} / ${result.total.toLocaleString()} source files`;
  element<HTMLElement>('coverage-score').textContent = `${result.coverage}%`;
  element<HTMLElement>('accounted-count').textContent = result.accounted.toLocaleString();
  element<HTMLElement>('missing-count').textContent = result.missing.toLocaleString();
  element<HTMLElement>('changed-count').textContent = result.changed.toLocaleString();

  const categories = element<HTMLDivElement>('category-results');
  categories.replaceChildren(...result.categories.map((category) => {
    const row = document.createElement('div');
    row.className = 'category-row';
    const name = document.createElement('span');
    name.textContent = category.name;
    const count = document.createElement('span');
    count.textContent = `${category.accounted}/${category.total} found`;
    row.append(name, count);
    return row;
  }));

  const issueList = element<HTMLDivElement>('issue-list');
  if (result.issues.length === 0) {
    const none = document.createElement('div');
    none.className = 'no-issues';
    none.textContent = 'No missing or changed files in the selected folder.';
    issueList.replaceChildren(none);
  } else {
    issueList.replaceChildren(...result.issues.map((issue) => {
      const row = document.createElement('div');
      row.className = 'issue-item';
      const kind = document.createElement('strong');
      kind.textContent = issue.kind;
      const path = document.createElement('span');
      path.textContent = `${issue.path} · ${formatBytes(issue.size)}`;
      row.append(kind, path);
      return row;
    }));
  }

  const conclusion = element<HTMLElement>('receipt-conclusion');
  conclusion.textContent = result.missing + result.changed === 0
    ? `All ${result.total.toLocaleString()} selected files are accounted for. Open representative destination files before wiping the source.`
    : `Do not wipe the source yet: ${result.missing.toLocaleString()} missing and ${result.changed.toLocaleString()} changed files need attention.`;
  receiptElement.hidden = false;
  if (scroll) receiptElement.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
}

compareButton.addEventListener('click', () => {
  if (!sourceInventory || !destinationInventory) return;
  comparison = compareInventories(sourceInventory, destinationInventory);
  renderReceipt(comparison);
  if (isPremium) void saveHistory(comparison).then(renderHistory);
});

element<HTMLButtonElement>('export-receipt').addEventListener('click', () => {
  if (!comparison) return;
  download(`backup-receipt-${comparison.checkedAt.slice(0,10)}.json`, JSON.stringify({ schema: 'backup-receipt/result-1', ...comparison }, null, 2), 'application/json');
});
element<HTMLButtonElement>('export-csv').addEventListener('click', () => {
  if (comparison) download(`backup-issues-${comparison.checkedAt.slice(0,10)}.csv`, comparisonCsv(comparison), 'text/csv');
});
element<HTMLButtonElement>('print-receipt').addEventListener('click', () => window.print());
element<HTMLButtonElement>('new-check').addEventListener('click', () => {
  sourceInventory = null;
  destinationInventory = null;
  comparison = null;
  sourceInput.value = '';
  destinationInput.value = '';
  manifestInput.value = '';
  sourceStatus.textContent = 'No source selected';
  destinationStatus.textContent = 'No destination selected';
  sourceCard.classList.remove('is-ready');
  destinationCard.classList.remove('is-ready');
  receiptElement.hidden = true;
  void clearActiveInventories();
  updateReadiness();
  sourceInput.focus();
});

interface LicenseVerdict { token: string; valid: boolean; checkedAt: number; reason: string; }

function cachedVerdict(): LicenseVerdict | null {
  try {
    const value = JSON.parse(localStorage.getItem(VERDICT_KEY) || 'null') as LicenseVerdict | null;
    return value && typeof value.checkedAt === 'number' ? value : null;
  } catch { return null; }
}

async function verifyLicense(token: string): Promise<void> {
  const status = element<HTMLElement>('license-status');
  const cached = cachedVerdict();
  if (cached?.token === token && cached.valid) setPremium(true);
  if (cached?.token === token && Date.now() - cached.checkedAt < DAY) {
    status.textContent = cached.valid ? 'Migration Kit active on this device.' : 'License no longer active. The free verifier is still available.';
    return;
  }
  if (!navigator.onLine) {
    status.textContent = cached?.valid ? 'Migration Kit active from the last check; verification will resume online.' : 'Saved license. Connect once to verify and unlock the archive.';
    return;
  }
  status.textContent = 'Checking license…';
  try {
    const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
    if (!response.ok) throw new Error('Verification service unavailable');
    const result = await response.json() as { valid?: boolean; reason?: string };
    const verdict = { token, valid: result.valid === true, checkedAt: Date.now(), reason: result.reason || 'invalid' };
    localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
    setPremium(verdict.valid);
    status.textContent = verdict.valid ? 'Migration Kit active on this device.' : 'License no longer active. The free verifier is still available; use the buy link to get a new license.';
  } catch {
    status.textContent = cached?.valid ? 'Migration Kit active; today’s online check could not finish.' : 'Could not verify right now. Check your connection and try again later.';
  }
}

function setPremium(active: boolean): void {
  isPremium = active;
  element<HTMLElement>('history-panel').hidden = !active;
  if (active) void renderHistory();
}

const licenseForm = element<HTMLFormElement>('license-form');
licenseForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const token = element<HTMLInputElement>('license-input').value.trim();
  if (!token) {
    element<HTMLElement>('license-status').textContent = 'Paste the complete license token first.';
    return;
  }
  localStorage.setItem(LICENSE_KEY, token);
  void verifyLicense(token);
});

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('history')) request.result.createObjectStore('history', { keyPath: 'checkedAt' });
      if (!request.result.objectStoreNames.contains('active')) request.result.createObjectStore('active', { keyPath: 'kind' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveActiveInventory(kind: 'source' | 'destination', inventory: Inventory): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction('active', 'readwrite');
  transaction.objectStore('active').put({ kind, inventory, updatedAt: Date.now() });
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function clearActiveInventories(): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction('active', 'readwrite');
  transaction.objectStore('active').clear();
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => { database.close(); resolve(); };
    transaction.onerror = () => { database.close(); reject(transaction.error); };
  });
}

async function restoreActiveInventories(): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction('active', 'readonly');
  const request = transaction.objectStore('active').getAll();
  const records = await new Promise<Array<{ kind: 'source' | 'destination'; inventory: Inventory }>>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Array<{ kind: 'source' | 'destination'; inventory: Inventory }>);
    request.onerror = () => reject(request.error);
  });
  database.close();
  for (const record of records) {
    if (record.kind === 'source') {
      sourceInventory = record.inventory;
      sourceStatus.textContent = `${record.inventory.label} / ${record.inventory.files.length.toLocaleString()} files / restored local inventory`;
      sourceCard.classList.add('is-ready');
    } else {
      destinationInventory = record.inventory;
      destinationStatus.textContent = `${record.inventory.label} / ${record.inventory.files.length.toLocaleString()} files / restored local inventory`;
      destinationCard.classList.add('is-ready');
    }
  }
  updateReadiness();
}

async function saveHistory(result: Comparison): Promise<void> {
  const database = await openDatabase();
  const transaction = database.transaction('history', 'readwrite');
  const store = transaction.objectStore('history');
  store.put(result);
  const allRequest = store.getAll();
  const all = await new Promise<Comparison[]>((resolve, reject) => {
    allRequest.onsuccess = () => resolve((allRequest.result as Comparison[]).sort((a, b) => b.checkedAt.localeCompare(a.checkedAt)));
    allRequest.onerror = () => reject(allRequest.error);
  });
  for (const item of all.slice(20)) store.delete(item.checkedAt);
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
}

async function getHistory(): Promise<Comparison[]> {
  const database = await openDatabase();
  const transaction = database.transaction('history', 'readonly');
  const request = transaction.objectStore('history').getAll();
  const values = await new Promise<Comparison[]>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as Comparison[]);
    request.onerror = () => reject(request.error);
  });
  database.close();
  return values.sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
}

async function renderHistory(): Promise<void> {
  const list = element<HTMLOListElement>('history-list');
  const history = await getHistory();
  if (history.length === 0) {
    const item = document.createElement('li');
    item.textContent = 'No saved receipts yet.';
    list.replaceChildren(item);
    return;
  }
  list.replaceChildren(...history.map((receipt) => {
    const item = document.createElement('li');
    item.textContent = `${new Date(receipt.checkedAt).toLocaleDateString()} · ${receipt.sourceLabel} · ${receipt.coverage}% covered`;
    return item;
  }));
}

element<HTMLButtonElement>('clear-history').addEventListener('click', async () => {
  if (!window.confirm('Clear all saved receipt summaries from this device? Exported files will not be affected.')) return;
  const database = await openDatabase();
  const transaction = database.transaction('history', 'readwrite');
  transaction.objectStore('history').clear();
  transaction.oncomplete = () => { database.close(); void renderHistory(); announce('Receipt archive cleared.'); };
});

async function updateNetworkState(): Promise<void> {
  let online = navigator.onLine;
  if (online && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
    try {
      const response = await fetch(`/online-check.txt?t=${Date.now()}`, { cache: 'no-store' });
      online = response.ok;
    } catch { online = false; }
  }
  element<HTMLElement>('offline-banner').hidden = online;
}
window.addEventListener('online', () => {
  void updateNetworkState();
  const token = localStorage.getItem(LICENSE_KEY);
  if (token) void verifyLicense(token);
});
window.addEventListener('offline', () => void updateNetworkState());
void updateNetworkState();

const query = new URLSearchParams(location.search);
const returnedLicense = query.get('license');
if (returnedLicense) {
  localStorage.setItem(LICENSE_KEY, returnedLicense);
  query.delete('license');
  const clean = `${location.pathname}${query.size ? `?${query.toString()}` : ''}${location.hash}`;
  history.replaceState(null, '', clean);
}
const storedLicense = returnedLicense || localStorage.getItem(LICENSE_KEY);
if (storedLicense) {
  element<HTMLInputElement>('license-input').value = storedLicense;
  void verifyLicense(storedLicense);
}

if (demoMode) {
  element<HTMLElement>('demo-banner').hidden = false;
  element<HTMLButtonElement>('reset-demo').addEventListener('click', async () => {
    await clearActiveInventories();
    loadDemoData();
    announce('Sample receipt reset.');
  });
  element<HTMLButtonElement>('start-real').addEventListener('click', async () => {
    await clearActiveInventories();
    location.assign('/');
  });
}

void restoreActiveInventories().then(() => {
  if (demoMode) loadDemoData();
}).catch(() => {
  if (demoMode) loadDemoData();
  else announce('Saved inventory could not be restored. You can start a new check.');
});

void listenForSafProgress((progress) => {
  scanLabel.textContent = progress.kind === 'source' ? 'Inventorying source…' : 'Inventorying destination…';
  scanCount.textContent = `${progress.current.toLocaleString()} / ${progress.total.toLocaleString()}`;
  scanFile.textContent = progress.path || 'Preparing inventory';
  const percent = progress.total === 0 ? 0 : Math.round((progress.current / progress.total) * 100);
  progressBar.style.width = `${percent}%`;
  progressTrack.setAttribute('aria-valuenow', String(percent));
}).catch(() => {
  // A browser build has no native plugin. The regular file picker remains available.
});

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const hadControllerAtStart = Boolean(navigator.serviceWorker.controller);
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then(() => updateNetworkState())
      .catch(() => {
        element<HTMLElement>('offline-banner').hidden = false;
        element<HTMLElement>('offline-banner').textContent = 'Offline installation is unavailable in this browser. Folder checks still work.';
      });
  });
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OFFLINE') {
      element<HTMLElement>('offline-banner').hidden = false;
      return;
    }
    if (event.data?.type !== 'APP_UPDATED') return;
    if (!hadControllerAtStart) return;
    const toast = element<HTMLDivElement>('toast');
    element<HTMLSpanElement>('toast-text').textContent = 'A fresh offline version is ready.';
    const button = element<HTMLButtonElement>('update-button');
    button.hidden = false;
    button.onclick = () => location.reload();
    toast.hidden = false;
  });
}
