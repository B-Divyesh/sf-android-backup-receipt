import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

interface ClaimEntry {
  id: string;
  test: string;
}

const claimsPath = new URL('../.factory/claims.json', import.meta.url);
const testSources = [
  new URL('./android-bridge.test.ts', import.meta.url),
  new URL('./core.test.ts', import.meta.url),
  new URL('./e2e/app.spec.ts', import.meta.url)
];

async function loadClaimContract() {
  const [claimsText, ...sources] = await Promise.all([
    readFile(claimsPath, 'utf8'),
    ...testSources.map(async (path) => ({ path: path.pathname, text: await readFile(path, 'utf8') }))
  ]);
  return { claims: JSON.parse(claimsText) as ClaimEntry[], sources };
}

describe('claims command contract', () => {
  it('routes resume-reset to its observable Playwright regression', async () => {
    const { claims, sources } = await loadClaimContract();
    const claim = claims.find(({ id }) => id === 'resume-reset');
    expect(claim?.test).toBe('npm run test:claims -- --grep @claim:resume-reset');
    expect(sources.find(({ path }) => path.endsWith('/e2e/app.spec.ts'))?.text)
      .toContain("test('@claim:resume-reset restores an interrupted check and clears it on request'");
  });

  it('maps every declared claim to exactly one tag in the matching test runner', async () => {
    const { claims, sources } = await loadClaimContract();
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);

    for (const claim of claims) {
      const tag = `@claim:${claim.id}`;
      const matches = sources.flatMap((source) =>
        Array.from({ length: source.text.split(tag).length - 1 }, () => source)
      );
      expect(matches, `${claim.id} must have exactly one tagged test`).toHaveLength(1);

      const expectedCommand = matches[0].path.includes('/e2e/')
        ? `npm run test:claims -- --grep ${tag}`
        : `npm run test:unit -- -t ${tag}`;
      expect(claim.test, `${claim.id} must invoke the runner containing its tag`).toBe(expectedCommand);
    }
  });
});
