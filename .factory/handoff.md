# Android Backup Receipt — adversarial review 3 handoff

## Outcome

**FAIL — 1 blocking, 3 major, and 1 minor finding.**

- Work order: `android-backup-receipt-review-3`
- Reviewed commit: `c93ed6891217d50b6affab76fdf0f72aaea3fed7`
- Production: <https://android-backup-receipt.sociobot.in>
- Live build: version `1.0.3`, build `4008a35e8d05`
- Full report: [review-3.md](review-3.md)

No product code was changed. The review and this handoff are the only intended
repository changes.

## What was checked

- Cold 390×844 and 1440×900 first reads.
- One-click populated demo, Reset, Start for real, real/demo storage isolation,
  Back, and live offline reload.
- Every exact command in `.factory/claims.json`, separately in a fresh clone.
- Full landing/README sentence audit and headings/actions review.
- All earlier review and polish findings against current source and production.
- Route titles, metadata, focus, announcements, designed 404, header/footer,
  links, request logs, axe, security headers, robots, sitemap, and visual
  identity.
- Brief-implied leverage, including self-hosted backup destinations and whether
  AI would help the deterministic comparison job.

## Verification results

- All 20 registered claim commands: PASS, one tagged test each.
- `npm test`: PASS — 18 Vitest and 21 Chromium tests.
- `npm run build`: PASS — `dist/` produced; 33.49 kB JavaScript raw / 11.90 kB
  gzip.
- Live demo: PASS — populated receipt and export controls fit in the first
  mobile viewport.
- Demo reset/exit isolation: PASS — demo data is removed; seeded real data is
  unchanged.
- Live offline sample, route/back behavior, valid-route console checks, axe,
  same-origin core requests, and product link crawl: PASS.

## Findings left for the repairer

1. F-3-1 (blocking; F-1-7 reopened): inventory and test JDK/APK/AAB/checksum/
   signing-fingerprint release statements, or remove them.
2. F-3-2: inventory and test merchant/refund statements, or narrow/remove them.
3. F-3-3: replace the hero fact strip with privacy, offline, and price facts and
   add adjacent sample-result copy.
4. F-3-4: add a tested SAF document-provider path for WebDAV/S3-backed folders
   and a concrete web manifest handoff.
5. F-3-5: standardise “receipt history” and “folder record” terminology.

## Reproduce

```sh
npm ci
npm test
npm run build
```

Run every `test` value in `.factory/claims.json` as a separate command from a
fresh clone. Then repeat the live checks at 390×844 and 1440×900. No deployment
or infrastructure change was made during this review.

## Review limitation

The container has no Android emulator or physical document provider. Native
SAF behavior was checked through the registered source contract tests. F-3-4
specifically calls for a fixture `DocumentsProvider` so the remote-provider
path becomes independently testable.
