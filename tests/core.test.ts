import { describe, expect, it } from 'vitest';
import { MANIFEST_SCHEMA, categoryFor, compareInventories, comparisonCsv, formatBytes, parseManifest, type Inventory } from '../src/core.ts';

const source: Inventory = {
  schema: MANIFEST_SCHEMA,
  label: 'DCIM',
  createdAt: '2026-08-28T12:00:00.000Z',
  files: [
    { path: 'Camera/one.jpg', size: 100, modified: 1, hash: 'aaa', hashMethod: 'sha256' },
    { path: 'Camera/two.jpg', size: 200, modified: 2, hash: 'bbb', hashMethod: 'sha256' },
    { path: 'notes.csv', size: 50, modified: 3, hash: 'ccc', hashMethod: 'sha256' }
  ]
};

describe('backup comparison', () => {
  it('classifies accounted, missing, changed, and extra files', () => {
    const destination: Inventory = {
      ...source,
      label: 'USB copy',
      files: [
        source.files[0],
        { ...source.files[1], hash: 'different' },
        { path: 'extra.txt', size: 1, modified: 4, hash: 'x', hashMethod: 'sha256' }
      ]
    };
    const result = compareInventories(source, destination, new Date('2026-08-28T13:00:00.000Z'));
    expect(result).toMatchObject({ total: 3, accounted: 1, missing: 1, changed: 1, extra: 1, coverage: 33.3 });
    expect(result.issues.map((issue) => issue.kind)).toEqual(['changed', 'missing']);
  });

  it('treats an empty source honestly', () => {
    const empty = { ...source, files: [] };
    expect(compareInventories(empty, empty).coverage).toBe(0);
  });
});

describe('portable formats', () => {
  it('round trips a valid manifest', () => expect(parseManifest(JSON.parse(JSON.stringify(source)))).toEqual(source));
  it('rejects an unknown manifest', () => expect(() => parseManifest({ schema: 'other' })).toThrow(/not supported/i));
  it('guards spreadsheet formula paths in CSV', () => {
    const result = compareInventories({ ...source, files: [{ ...source.files[0], path: '=SUM(A1)' }] }, { ...source, files: [] });
    expect(comparisonCsv(result)).toContain("\"'=SUM(A1)\"");
  });
});

describe('presentation helpers', () => {
  it('classifies useful Android media groups', () => {
    expect(categoryFor('Camera/IMG.heic')).toBe('Photos');
    expect(categoryFor('Signal/export.backup')).toBe('Exports & archives');
  });
  it('formats byte counts', () => expect(formatBytes(1_048_576)).toBe('1.0 MB'));
});
