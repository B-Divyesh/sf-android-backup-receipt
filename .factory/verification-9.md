# Independent verification 9 — Android Backup Receipt

## Verdict: **PASS**

- Candidate commit: `b6630f60f615a9454cf2c1209794092935d82909`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Verified: 2026-08-29 UTC

The live deployment is the candidate: all 24 publicly served build files from
the fresh `dist/` match production byte-for-byte. The deployment-only concern
does not reproduce.

## First read and demo gate

Cold production read, without prior storage:

- It does: checks selected Android phone and backup folders before a wipe and
  issues a receipt showing which selected files match.
- It is for: Android owners moving phones.
- Click first: **Try it with sample data**.

All three answers are on the first screen in plain words. The one-click action
opens `/demo`. The 390×844 demo immediately shows the persistent “Demo —
sample data, nothing is saved to your real check” banner, Reset demo and Start
for real controls, 2 accounted files, 1 missing file, 1 changed file, 1 extra
file, and 50% coverage.

## Required claim gate

After `npm ci`, I ran every exact command declared in `.factory/claims.json`
separately, from the local demo entry point. All **22/22** passed, each
selecting its tagged test:

`demo-sample-receipt`, `demo-reset-isolation`, `resume-reset`,
`local-only-files`, `no-tracking-runtime`, `receipt-exports`,
`sha256-evidence`, `hash-boundary`, `comparison-manifest`,
`multi-folder-receipt`, `saf-read-only`, `android-private-backup`,
`android-updates`, `android-release-assets`, `remote-provider-access`,
`local-metadata-storage`, `migration-archive`, `license-revocation`,
`print-view`, `responsive-keyboard`, `offline-reload`, and
`offline-exports`.

Exact command/status/timing evidence is in
`qa-evidence/verification-9/claim-results.json`; one full log per claim is in
the same directory.

## Local gates

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages installed; audit reported 0 vulnerabilities |
| `npm test` | PASS — 20 Vitest tests and 21 Playwright tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — generated `dist/` |
| `npx cap sync android` | PASS — copied web assets and updated plugins without source changes |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `./android/gradlew assembleDebug` | Not runnable: no `java` executable or `JAVA_HOME` in the verifier image |

The production build reports 33.78 kB raw / 11.99 kB gzip JavaScript and
18.81 kB raw / 4.66 kB gzip CSS, within the static budgets.

## Product behavior, recovery, and PWA

- Independent live demo export produced schema `backup-receipt/result-1` with
  4 total, 2 accounted, 1 missing, 1 changed, and 1 extra. JSON and CSV
  downloads succeeded; the CSV had the header plus two issue rows.
- The full local suite exercised source/destination comparison, resumed local
  inventory, reset, multiple pairs, imported records, exact 32 MiB full
  SHA-256 versus 32 MiB + 1 byte sampled SHA-256, print, and receipt history.
- A malformed manifest on live production produced the plain recovery text:
  “That file is not a valid folder record. Choose one downloaded from this
  app.”
- A fresh live service-worker-controlled demo (`registration.update()` included)
  remained controlled and active, then reloaded offline with its receipt
  visible. The dedicated offline-reload and offline-exports claim tests also
  passed.

## Live privacy, accessibility, security, and performance

- Cold home and demo request logs contained only the product origin. No
  analytics, ads, remote fonts, or third-party scripts loaded. An explicit
  invalid license check returned `{"valid":false,"reason":"invalid"}` from
  the disclosed Sociobot billing endpoint.
- Home, demo, privacy, terms, and offline pages were HTTP 200 with one `h1`,
  one `main`, `lang=en`, complete image alt text, and no console/page errors.
  The designed unknown route correctly returned HTTP 404; its browser emits
  the expected failed-document console message for that HTTP status, not an
  application error.
- Axe found zero serious or critical violations on every route. At 390px
  there was no horizontal overflow; the skip link moved focus to `main`, the
  focus indicator was a visible 3px blue outline, and reduced motion reduced
  transition duration to `0.00001s`.
- Headers include a self-only CSP with header-level `frame-ancestors 'none'`,
  HSTS, `nosniff`, strict-origin referrer policy, and restrictive permissions
  policy. Fingerprinted assets are immutable for one year; `sw.js` is
  no-cache/no-store; the manifest has the correct MIME type.
- Fresh mobile Lighthouse: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.1 s, CLS 0, TBT 0 ms, 62 KiB transfer.

## Deployment and Android release evidence

- Live `/` SHA-256 and local `dist/index.html` are both
  `972108a8485fac06d9e97744f7b1793332ce339cf8c0d52d2af62251813346e3`.
- Live application JavaScript and local `dist/assets/app-Bdhd1eRr.js` are both
  `4330b935a138a505ba88c0162c330b3d58128eda3fef9e25fabec7701aaec61f`.
- The parity probe found 24/24 public files identical. The only unmatched
  `dist` file was `staticwebapp.config.json`, correctly not exposed publicly
  (HTTP 404).
- The latest published Android release is `android-v1.0.3-build-13`. Its APK
  SHA-256 is `93b82fdc2bd832520446cd0e355859d3d3bf117219d097eb51e076cbf5231a92`,
  matching `SHA256SUMS`; ZIP integrity passed. The `android-release-assets`
  claim separately downloaded and verified both APK/AAB and the published
  signing-certificate fingerprint.

## Server allowance

The sole server-side product call is license verification. From one fresh,
cookie-preserving client, requests 1–30 returned HTTP 200. Requests 31–35
returned HTTP 429 and `Retry-After: 3`. Observed allowance: **30 requests per
window**. See `qa-evidence/verification-9/rate-limit-status.tsv` and
`billing-first-429.headers`.

## Findings by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Verification limitation

This verifier image has no JDK or Android runtime, so a local Gradle APK build
and on-device SAF interaction could not be run. This is an environment
limitation rather than a candidate failure: Capacitor sync, native source
contract tests, the signed public release checksums, and ZIP integrity passed.

Evidence directory: `qa-evidence/verification-9/`.
