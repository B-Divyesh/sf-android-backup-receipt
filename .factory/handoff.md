# Android Backup Receipt — verification 9 handoff

## Outcome

**PASS — independent QA found no product defects.**

- Candidate: `b6630f60f615a9454cf2c1209794092935d82909`
- Production: <https://android-backup-receipt.sociobot.in>
- All 22 exact claim commands, `npm test`, lint, production build, Capacitor
  sync, live privacy/a11y/PWA/performance checks, and deployment parity passed.
- Live production matches 24/24 public candidate build files byte-for-byte.
- Billing verification allowed 30 requests, then enforced HTTP 429 with
  `Retry-After: 3`.

See [verification 9](verification-9.md) and `qa-evidence/verification-9/` for
commands, screenshots, logs, headers, hashes, and route evidence.

Known limitation: this container has no JDK, so `./android/gradlew
assembleDebug` could not start. Capacitor sync, native contract tests, and
published signed APK/AAB checksum verification passed. Run the native build on
a JDK-equipped runner before a native-only release change.

---

# Prior polish round 3 handoff

## Outcome

**PASS — every finding in reviews 1, 2, and 3 is closed.**

- Product: <https://android-backup-receipt.sociobot.in>
- Final repair commits: `03526f9`, `285d73f`, and `02a29a0`
- Static deployment: `a59c280b-2b1c-4429-ab86-599cb6ee0f79`
- Android release workflow: [run 33279501721](https://github.com/B-Divyesh/sf-android-backup-receipt/actions/runs/33279501721), success
- Current Android release: `android-v1.0.3-build-13` with APK, AAB,
  `SHA256SUMS`, and `SIGNING_CERT_SHA256.txt`

## What changed

- Added proved release-asset coverage and an APK-checksum label. The new test
  hashes the public APK and AAB against the immutable release checksum file.
- Removed merchant/refund language that the static product cannot prove. The
  recorded expired, revoked, and wrong-product verification outcomes now each
  prove that only paid receipt history remains unavailable.
- Rewrote the first screen with explicit privacy, offline, and price facts and
  a result sentence beside the sample action.
- Added the read-only Android remote-provider entry point for installed
  WebDAV/S3 document providers, a browser saved-record handoff, and an Android
  `DocumentsProvider` instrumentation fixture for that SAF path.
- Standardized visible “folder record” and “receipt history” language.

## Verification

Clean clone: `/tmp/abr-polish3-final.Wdjpo3` at `02a29a0`.

- `npm ci`: passed; `npm audit --omit=dev`: 0 vulnerabilities.
- All 22 exact commands in `.factory/claims.json` passed separately. The log
  is `/tmp/abr-polish3-final-claims.log`; each command selected exactly one
  tagged test.
- `npm run lint`: passed.
- `npm test`: passed — 20 Vitest tests and 21 Playwright tests.
- `npm run build`: passed. Initial JS is 33.78 kB raw / 11.99 kB gzip; CSS is
  18.81 kB raw / 4.66 kB gzip.
- Local Lighthouse: 100 Performance, 100 Accessibility, 100 Best Practices,
  100 SEO; LCP 1.20 s, CLS 0, TBT 0 ms.
- Production Lighthouse: 100 Performance, 100 Accessibility, 100 Best
  Practices, 100 SEO; LCP 1.06 s, CLS 0, TBT 0 ms.
- Production cold check: home and demo have title/lang/one h1/main/alts and
  no console errors. See
  `.factory/qa-evidence/polish-3/live/verify-home/verify.json` and
  `verify-demo/verify.json`.
- Production Axe: zero serious or critical findings on home, demo, privacy,
  terms, offline, and designed 404. The full cold probe is
  `.factory/qa-evidence/polish-3/live/report.json`.
- Production mobile demo: receipt y=178–699.7; its summary, issue list, and
  JSON/CSV actions all fit inside 390×844. Home facts end at y=701.0 with no
  horizontal overflow. Screenshots: `live/home-mobile-cold.png`,
  `live/demo-mobile-cold.png`, `live/home-desktop-cold.png`.
- The live and deployed local `dist/index.html` match SHA-256
  `972108a8485fac06d9e97744f7b1793332ce339cf8c0d52d2af62251813346e3`.
- Live crawl: home, demo, privacy, terms, and offline returned 200; source
  returned 200; APK/checksum links returned 302 to build 13; checkout returned
  its expected hosted-checkout 303. See `live/link-check.json`.
- Live offline demo reload, route metadata/focus/Back, demo isolation, public
  request privacy, export, print, keyboard, and mobile behavior are covered by
  the claim/browser suite and the cold production probe.

## Notes

The static work order deploys `dist/`; the Capacitor project remains included
for the separate APK release flow. This worker has no JDK (`JAVA_HOME` and
`java` are absent), so it could not run `assembleDebug` locally. The matching
GitHub Android workflow completed successfully and published build 13, which
the release-assets claim downloaded and checksum-verified. There are no known
product findings or deferred fixes.

## Run locally

```sh
npm ci
npm test
npm run build
```

Run every exact command in `.factory/claims.json` separately for the complete
claim suite. Deploy the generated `dist/` with the static work-order deployer.
