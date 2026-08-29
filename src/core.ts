export const MANIFEST_SCHEMA = 'backup-receipt/1';
export const FULL_HASH_LIMIT = 32 * 1024 * 1024;
const SAMPLE_SIZE = 1024 * 1024;

export type HashMethod = 'sha256' | 'sampled-sha256';

export interface FileEvidence {
  path: string;
  size: number;
  modified: number;
  hash: string;
  hashMethod: HashMethod;
}

export interface Inventory {
  schema: typeof MANIFEST_SCHEMA;
  label: string;
  createdAt: string;
  files: FileEvidence[];
}

export type IssueKind = 'missing' | 'changed';

export interface FileIssue {
  path: string;
  kind: IssueKind;
  size: number;
  category: string;
}

export interface CategoryResult {
  name: string;
  total: number;
  accounted: number;
  missing: number;
  changed: number;
}

export interface Comparison {
  sourceLabel: string;
  destinationLabel: string;
  checkedAt: string;
  total: number;
  accounted: number;
  missing: number;
  changed: number;
  extra: number;
  coverage: number;
  fullHashes: number;
  sampledHashes: number;
  issues: FileIssue[];
  categories: CategoryResult[];
}

export interface ScanProgress {
  current: number;
  total: number;
  path: string;
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function isSha256Hex(value: string): boolean {
  return /^[a-f0-9]{64}$/i.test(value);
}

async function sha256(bytes: ArrayBuffer): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', bytes));
}

export async function hashFile(file: File, signal?: AbortSignal): Promise<{ hash: string; method: HashMethod }> {
  if (signal?.aborted) throw new DOMException('Scan cancelled', 'AbortError');

  if (file.size <= FULL_HASH_LIMIT) {
    const bytes = await file.arrayBuffer();
    if (signal?.aborted) throw new DOMException('Scan cancelled', 'AbortError');
    return { hash: await sha256(bytes), method: 'sha256' };
  }

  const middleStart = Math.max(SAMPLE_SIZE, Math.floor(file.size / 2) - Math.floor(SAMPLE_SIZE / 2));
  const endStart = Math.max(middleStart + SAMPLE_SIZE, file.size - SAMPLE_SIZE);
  const samples = await Promise.all([
    file.slice(0, SAMPLE_SIZE).arrayBuffer(),
    file.slice(middleStart, middleStart + SAMPLE_SIZE).arrayBuffer(),
    file.slice(endStart, file.size).arrayBuffer()
  ]);
  if (signal?.aborted) throw new DOMException('Scan cancelled', 'AbortError');
  const sizeBytes = new TextEncoder().encode(String(file.size));
  const merged = new Uint8Array(samples.reduce((total, sample) => total + sample.byteLength, sizeBytes.byteLength));
  let offset = 0;
  for (const sample of samples) {
    merged.set(new Uint8Array(sample), offset);
    offset += sample.byteLength;
  }
  merged.set(sizeBytes, offset);
  return { hash: await sha256(merged.buffer), method: 'sampled-sha256' };
}

export function relativeFilePath(file: File): string {
  const supplied = file.webkitRelativePath || file.name;
  const segments = supplied.split('/').filter(Boolean);
  return (segments.length > 1 ? segments.slice(1) : segments).join('/').normalize('NFC');
}

export function folderLabel(files: readonly File[], fallback: string): string {
  const path = files[0]?.webkitRelativePath;
  return path?.split('/').filter(Boolean)[0] || fallback;
}

export async function buildInventory(
  files: readonly File[],
  label: string,
  onProgress: (progress: ScanProgress) => void,
  signal?: AbortSignal
): Promise<Inventory> {
  const evidence: FileEvidence[] = [];
  const ordered = [...files].sort((a, b) => relativeFilePath(a).localeCompare(relativeFilePath(b)));

  for (let index = 0; index < ordered.length; index += 1) {
    const file = ordered[index];
    const path = relativeFilePath(file);
    onProgress({ current: index, total: ordered.length, path });
    const result = await hashFile(file, signal);
    evidence.push({ path, size: file.size, modified: file.lastModified, hash: result.hash, hashMethod: result.method });
    onProgress({ current: index + 1, total: ordered.length, path });
    if (index % 4 === 3) await new Promise<void>((resolve) => window.setTimeout(resolve, 0));
  }

  return { schema: MANIFEST_SCHEMA, label, createdAt: new Date().toISOString(), files: evidence };
}

export function categoryFor(path: string): string {
  const extension = path.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg','jpeg','png','gif','webp','heic','heif','dng','raw','avif'].includes(extension)) return 'Photos';
  if (['mp4','mov','mkv','webm','3gp','avi'].includes(extension)) return 'Videos';
  if (['mp3','m4a','wav','flac','ogg','opus','aac'].includes(extension)) return 'Audio';
  if (['pdf','txt','md','doc','docx','odt','xls','xlsx','csv','ppt','pptx'].includes(extension)) return 'Documents';
  if (['zip','tar','gz','7z','json','xml','backup','bak'].includes(extension)) return 'Exports & archives';
  return 'Other files';
}

export function compareInventories(source: Inventory, destination: Inventory, now = new Date()): Comparison {
  const destinationByPath = new Map(destination.files.map((file) => [file.path, file]));
  const sourcePaths = new Set(source.files.map((file) => file.path));
  const issues: FileIssue[] = [];
  let accounted = 0;
  let missing = 0;
  let changed = 0;

  const categoryMap = new Map<string, CategoryResult>();
  for (const sourceFile of source.files) {
    const category = categoryFor(sourceFile.path);
    const categoryResult = categoryMap.get(category) ?? { name: category, total: 0, accounted: 0, missing: 0, changed: 0 };
    categoryResult.total += 1;
    const destinationFile = destinationByPath.get(sourceFile.path);
    if (!destinationFile) {
      missing += 1;
      categoryResult.missing += 1;
      issues.push({ path: sourceFile.path, kind: 'missing', size: sourceFile.size, category });
    } else if (sourceFile.size !== destinationFile.size || sourceFile.hash !== destinationFile.hash) {
      changed += 1;
      categoryResult.changed += 1;
      issues.push({ path: sourceFile.path, kind: 'changed', size: sourceFile.size, category });
    } else {
      accounted += 1;
      categoryResult.accounted += 1;
    }
    categoryMap.set(category, categoryResult);
  }

  const total = source.files.length;
  return {
    sourceLabel: source.label,
    destinationLabel: destination.label,
    checkedAt: now.toISOString(),
    total,
    accounted,
    missing,
    changed,
    extra: destination.files.filter((file) => !sourcePaths.has(file.path)).length,
    coverage: total === 0 ? 0 : Math.round((accounted / total) * 1000) / 10,
    fullHashes: source.files.filter((file) => file.hashMethod === 'sha256').length,
    sampledHashes: source.files.filter((file) => file.hashMethod === 'sampled-sha256').length,
    issues,
    categories: [...categoryMap.values()].sort((a, b) => a.name.localeCompare(b.name))
  };
}

export function parseManifest(value: unknown): Inventory {
  if (!value || typeof value !== 'object') throw new Error('This file is not a Backup Receipt manifest.');
  const candidate = value as Partial<Inventory>;
  if (candidate.schema !== MANIFEST_SCHEMA || typeof candidate.label !== 'string' || !Array.isArray(candidate.files)) {
    throw new Error('Manifest format is not supported. Export a fresh manifest from this app.');
  }
  const files = candidate.files.map((file) => {
    if (!file || typeof file.path !== 'string' || typeof file.size !== 'number' || typeof file.hash !== 'string' || !isSha256Hex(file.hash) || !['sha256','sampled-sha256'].includes(file.hashMethod)) {
      throw new Error('Manifest contains an invalid file entry.');
    }
    return { path: file.path, size: file.size, modified: Number(file.modified) || 0, hash: file.hash, hashMethod: file.hashMethod } as FileEvidence;
  });
  return { schema: MANIFEST_SCHEMA, label: candidate.label, createdAt: typeof candidate.createdAt === 'string' ? candidate.createdAt : new Date(0).toISOString(), files };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B','KB','MB','GB','TB'];
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / (1024 ** unit)).toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
}

function csvSafe(value: string): string {
  const guarded = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${guarded.replaceAll('"', '""')}"`;
}

export function comparisonCsv(comparison: Comparison): string {
  const rows = ['status,category,path,size_bytes'];
  for (const issue of comparison.issues) {
    rows.push([issue.kind, issue.category, issue.path, String(issue.size)].map(csvSafe).join(','));
  }
  return `${rows.join('\n')}\n`;
}
