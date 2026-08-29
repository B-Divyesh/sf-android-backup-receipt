# Independent verification 8 — Android Backup Receipt

## Verdict: **PASS**

- Candidate: `f4cfe8f5a402275c6aa018840b580af17a548ec6`
- Production: <https://android-backup-receipt.sociobot.in>
- Live build ID: `4008a35e8d05`
- Verified: 2026-08-29 UTC

No release-blocking or lower-severity product defect was found. The previous
deployment-only concern is not present: every publicly served file in the
fresh `dist/` build matches production byte-for-byte. The previous
`resume-reset` claims-runner defect is also fixed; its declared Playwright test
runs one test and passes.

## First read and demo gate

Cold production page:

- What it does: checks selected Android phone and backup folders before a wipe,
  then shows which selected files match.
- Who it is for: Android owners moving phones.
- What to click first: **Try it with sample data**.

All three answers appear in plain words in the first screen. The primary action
opens `/demo` in one click. At 390×844, the resulting receipt is already visible
in the first screen with 2 matched, 1 missing, 1 changed, 1 extra, and 50%
coverage. The persistent demo banner says that sample data is not saved to the
real check and offers **Reset demo** and **Start for real**.

## Claims gate

After the clean-clone prerequisite `npm ci`, every exact command in
`.factory/claims.json` ran independently. Each selected one tagged test and
passed; no command passed with zero tests.

| Claim | Result |
| --- | --- |
| `demo-sample-receipt` | PASS — 1 Playwright test |
| `demo-reset-isolation` | PASS — 1 Playwright test |
| `resume-reset` | PASS — 1 Playwright test |
| `local-only-files` | PASS — 1 Playwright test |
| `no-tracking-runtime` | PASS — 1 Playwright test |
| `receipt-exports` | PASS — 1 Playwright test |
| `sha256-evidence` | PASS — 1 Playwright test |
| `hash-boundary` | PASS — 1 Vitest test |
| `comparison-manifest` | PASS — 1 Playwright test |
| `multi-folder-receipt` | PASS — 1 Playwright test |
| `saf-read-only` | PASS — 1 Vitest test |
| `android-private-backup` | PASS — 1 Vitest test |
| `android-updates` | PASS — 1 Vitest test |
| `local-metadata-storage` | PASS — 1 Playwright test |
| `migration-archive` | PASS — 1 Playwright test |
| `license-revocation` | PASS — 1 Playwright test |
| `print-view` | PASS — 1 Playwright test |
| `responsive-keyboard` | PASS — 1 Playwright test |
| `offline-reload` | PASS — 1 Playwright test |
| `offline-exports` | PASS — 1 Playwright test |

The full output is in
[`qa-artifacts/claims-after-install.log`](qa-artifacts/claims-after-install.log).
Landing, legal, and README claims were cross-checked against the manifest; no
unlisted capability or privacy claim was found.

## Clean local gates

| Gate | Result |
| --- | --- |
| `npm ci` | PASS — 149 packages, 0 vulnerabilities |
| `npm test` | PASS — 18 Vitest and 21 Chromium tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — `dist/` produced |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npx cap sync android` | PASS |

Production bundle sizes are 33,491 bytes JavaScript (11,880 gzip), 18,503
bytes CSS (4,624 gzip), and 62,232 bytes for the largest image. These are below
the 200 KB JS, 50 KB CSS, and 300 KB hero-image budgets.

## End-to-end and recovery evidence

An independent live flow compared a three-file phone folder with a three-file
backup folder. It produced 1 matched, 1 missing, 1 changed, and 1 extra file,
with the explicit conclusion not to wipe the phone. Reload restored both local
inventories; **Start another check** cleared them. Malformed JSON and an
unsupported manifest schema each produced a plain recovery instruction.

Boundary coverage passed for an empty source, exact 32 MiB full SHA-256, and
32 MiB + 1 byte sampled SHA-256. The sample exported a valid detailed receipt
and two-row CSV issue list. Multi-folder comparison, folder-record import,
print, license rejection, history cap, and demo isolation passed in the full
suite.

## Live privacy, security, routes, and accessibility

- The cold home, demo, offline, and real-folder flows made only same-origin
  requests. No analytics, ads, remote fonts, or third-party runtime scripts
  loaded. The optional invalid-license flow made exactly one disclosed request
  to `api.sociobot.in`.
- The invalid license was removed from the URL, history stayed locked, and the
  free folder checker remained available.
- Production sends CSP with header-only `frame-ancestors 'none'`, HSTS,
  `nosniff`, strict-origin referrer policy, restrictive Permissions Policy, and
  `X-Frame-Options: DENY`.
- Billing CORS allows the product origin and does not return an allow-origin
  header for `https://example.com`.
- Desktop 1440px and mobile 390×844 had no horizontal overflow. Every visible
  mobile action tested at least 44px, and 200% text resizing preserved the
  primary action without horizontal overflow.
- Keyboard-only testing passed the first-tab skip link, main focus transfer,
  and Enter activation of the folder chooser. Focus is a visible 3px blue ring
  with a 4px offset. No keyboard trap appeared.
- Axe found zero violations on home and populated demo, and zero
  serious/critical findings on privacy, terms, offline, and the designed 404.
  Reduced motion changes transitions/animations to `0.00001s` and scrolling to
  `auto`.
- The mandated `verify-url.sh` passed: HTTP 200, 946ms observed load, title,
  `lang=en`, one `h1`, `main`, complete alt text, labelled buttons, and zero
  console/page errors.
- Every discovered internal and external link resolved. The checkout returned
  303 to the hosted Dodo checkout. There is no sign-in flow.

## PWA and performance

The service-worker-controlled sample reloaded offline with its receipt and
offline banner, then downloaded JSON and CSV while disconnected. A fresh
old-to-new worker simulation replaced the old cache, retained control, and
showed **A fresh offline version is ready.** with a Reload action. The live
worker uses cache `backup-receipt-4008a35e8d05-shell`.

Lighthouse 13.0.1 mobile results:

- Performance 99
- Accessibility 100
- Best Practices 100
- SEO 100
- FCP 1.1s; LCP 1.1s; TBT 100ms; CLS 0
- 62,806 bytes transferred; 0 third-party resources

Fingerprinted JS/CSS use `public, max-age=31536000, immutable`; `sw.js` is
`no-cache, no-store, must-revalidate`; HTML revalidates after 30 seconds; the
manifest has `application/manifest+json`.

## Deployment identity and Android artifact

All 24 public files in the clean `dist/` artifact match production SHA-256
values. The local and live footer both report build `4008a35e8d05`; the live
service worker uses the same version.

The published release is `android-v1.0.3-build-11`. Its APK:

- downloads successfully and passes ZIP integrity;
- has SHA-256
  `83aa18714ce7b77d1f38b0d05d0de768df20000e65f02539b7f3202ddc2e08c0`,
  matching both `SHA256SUMS` and GitHub's asset digest;
- contains `classes.dex`;
- embeds `index.html` and `sw.js` that match the candidate build byte-for-byte;
- is signed by `CN=Android Backup Receipt, OU=Param Factory, O=Sociobot,
  C=IN` with SHA-256 fingerprint
  `A6:10:61:7B:7B:34:3A:B0:A6:18:03:A2:AD:B5:EF:EC:25:56:57:4B:04:71:09:3A:64:E3:A8:04:2B:8F:3B:01`,
  matching the published fingerprint.

The release workflow for that tag completed successfully. Changes from the
release tag to this candidate are verification documentation and the claims
contract regression test; no native or web product source changed.

## Server allowance

The only server-side product call is license verification. A fresh sequential
probe returned HTTP 200 for requests 1–30. Request 31 and subsequent requests
returned HTTP 429 with `Retry-After` values from 3 to 2 seconds. Observed
allowance: **30 requests per window**.

## Findings by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Verification limitation

This verifier image has no Java runtime, Android SDK, emulator, or physical
Android document provider, so `./gradlew assembleDebug` cannot start. This is
an environment limitation, not a candidate defect. Native contract tests,
Capacitor sync, the successful release workflow, APK integrity, embedded-web
identity, and signer verification all passed.
