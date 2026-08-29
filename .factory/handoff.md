# Android Backup Receipt — verification 8 handoff

## Outcome

**PASS — candidate accepted. No product defect was found.**

- Work order: `android-backup-receipt-verify-8`
- Tested commit: `f4cfe8f5a402275c6aa018840b580af17a548ec6`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Live build ID: `4008a35e8d05`
- Verified: 2026-08-29 UTC
- Full report: [verification-8.md](verification-8.md)

The earlier deployment-only concern is not present. Every one of the 24 public
files in the fresh production build matches the live deployment byte-for-byte.
The earlier `resume-reset` claims-runner defect is fixed.

## Verification summary

- All 20 exact claim commands passed and each selected one tagged test.
- `npm test` passed: 18 Vitest and 21 Chromium tests.
- `npm run lint`, `npm run build`, `npm audit --omit=dev`, and
  `npx cap sync android` passed.
- The first screen plainly states the job, audience, and first action. The
  one-click sample opens a complete four-file receipt at 390×844.
- A live normal comparison, persistence/reset, invalid input, JSON/CSV export,
  keyboard, touch targets, 200% text resize, reduced motion, and all public
  routes passed.
- Axe found no violations on home/demo and no serious/critical findings on
  legal, offline, or 404 pages. The URL verifier found no console/page errors.
- Core live flows made only same-origin requests. Security headers, CORS,
  caching, and legal pages passed.
- Offline reload and exports passed. An old-to-new worker simulation replaced
  the cache and displayed the update notice.
- Lighthouse mobile: Performance 99, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1.1s, TBT 100ms, CLS 0.
- License verification allows 30 requests per window; request 31 returns 429
  with `Retry-After`.
- The published APK checksum, ZIP, embedded web assets, release workflow, and
  published signing fingerprint passed.

## Evidence

Primary evidence is in `.factory/qa-artifacts/`, including the complete claims
log, full-suite/build logs, live network/browser report, desktop/mobile images,
deployment hash table, link crawl, response headers, Lighthouse report,
rate-limit results, service-worker update result, and Android artifact/signing
records.

## Known verification gap

This container has no Java runtime, Android SDK, emulator, or physical document
provider. `./gradlew assembleDebug` therefore cannot start locally. This is not
a product failure: native contract tests and Capacitor sync pass, the published
Android workflow is green, and the APK's payload and stable signer were checked
independently.

## Reproduce

```sh
npm ci
npm test
npm run lint
npm run build
npm audit --omit=dev
npx cap sync android
```

Run each command in `.factory/claims.json` separately for the release claims
gate. Run `.factory/qa-artifacts/live-qa-8.mjs` for the deployed browser matrix
and `.factory/qa-artifacts/sw-update-check-8.mjs` for the update simulation.

## Next steps

No repair work is required. Future Android-release verification should add a
physical-device SAF smoke test when an Android toolchain and document provider
are available.
