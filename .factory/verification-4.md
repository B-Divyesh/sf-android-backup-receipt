# Independent product verification 4

## Verdict: PASS

- Candidate commit: `7707453758139b581376ac14e631d41e2a76be19`
- Repository/branch: `B-Divyesh/sf-android-backup-receipt`, `main`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Verified: 2026-08-29 16:08–16:16 UTC
- Scope: clean-install independent QA; product source was not modified.

The prior deployment-only concern is not present. The candidate's generated
`dist/` matches production byte-for-byte (23 public files), and the live footer
reports the matching `Version 1.0.2 · Build 62ab8aab61ac`.

## Mandatory preflight

`npm ci` from this checkout installed 149 packages and reported zero
vulnerabilities. `.factory/claims.json` exists and contains 16 claims. Every
declared command was run independently from the clean install against its
shipped demo entry point; all returned zero:

| Claim | Result |
| --- | --- |
| `demo-sample-receipt` | PASS — 1 Playwright test |
| `resume-reset` | PASS — 1 Playwright test |
| `local-only-files` | PASS — 1 Playwright test |
| `receipt-exports` | PASS — 1 Playwright test |
| `sha256-evidence` | PASS — 1 Playwright test |
| `hash-boundary` | PASS — 1 Vitest test |
| `comparison-manifest` | PASS — 1 Playwright test |
| `saf-read-only` | PASS — 1 Vitest test |
| `android-private-backup` | PASS — 1 Vitest test |
| `android-updates` | PASS — 1 Vitest test |
| `local-metadata-storage` | PASS — 1 Playwright test |
| `migration-archive` | PASS — 1 Playwright test |
| `license-revocation` | PASS — 1 Playwright test |
| `print-view` | PASS — 1 Playwright test |
| `responsive-keyboard` | PASS — 1 Playwright test |
| `offline-reload` | PASS — 1 Playwright test |

### Cold first read

At 1440×900, a fresh live visit says **“Check an Android backup before you
wipe.”** It says it is for **Android owners moving phones**, explains that it
compares selected folders and produces a restore receipt, and makes **“Try it
with sample data”** the first primary action. One click opens `/demo`, which
immediately shows the isolated four-file receipt and its persistent reset/start
real banner. The mandatory plain-words/demo gate passes.

## Local quality gates

| Check | Result |
| --- | --- |
| `npm test` | PASS — 15 Vitest tests and 17 Chromium tests; Playwright `test-results/.last-run.json` says `passed` with no failed tests |
| `npm run lint` | PASS — `tsc --noEmit` |
| `npm run build` | PASS — `dist/` produced |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |
| `npx cap sync android` | PASS |

Production build output is 27,743 B JavaScript (10,372 B gzip) and 14,698 B
CSS (4,033 B gzip); the complete static JavaScript output is 30,786 B, within
the applicable initial bundle budget. `./gradlew assembleDebug` could not run:
this `deploy: none` verification container has no Java/JDK (`JAVA_HOME` unset,
no `java` on `PATH`). This is an environment limitation anticipated by the
Android work order, not a product test failure. The downloaded current APK
passed ZIP integrity and has SHA-256
`b1fb4844fea3c92c82bced749925f1291b456928857a720147c52a03fc8fa536`, exactly
matching the release `SHA256SUMS`; it contains `classes.dex` and the same
candidate `index.html`, JS, CSS, and service worker bytes.

## End-to-end, accessibility, privacy, and deployment evidence

- Live `/demo` showed 4 source files, 2 accounted, 1 missing, 1 changed, 1
  extra, and 50% coverage. Its receipt warns not to wipe the source.
- JSON and CSV exports, source-manifest export/import, print view, local
  resume/reset, complete demo SHA-256 evidence, 32 MiB hash boundary, and
  invalid-manifest recovery are covered by the independent claim runs. A direct
  live malformed JSON import said, “That file is not valid JSON. Choose a
  manifest exported from this app.” Importing a freshly exported manifest then
  recovered to “Pixel 7 / DCIM + exports manifest / 4 files.”
- A live Playwright request log for home → one-click demo recorded 10 requests,
  all to `https://android-backup-receipt.sociobot.in`; there were no console or
  page errors. This confirms the core check's local-only/no-third-party-runtime
  promise. The optional billing request is separately disclosed and its CORS
  response allows this product origin.
- Axe on the live populated demo reported **0 serious/critical** findings.
  Desktop and 390×844 mobile had no horizontal overflow. The visible Reset demo
  control measured 88×44 px. Keyboard Tab reaches “Skip to verification” with
  a visible `rgb(48, 73, 195)` 3px outline; Enter moves focus to `main`.
  Reduced motion makes transitions/animations `0.00001s`.
- After service-worker control, live `/demo` reloaded offline with its receipt,
  50% coverage, and offline banner still present, with no errors.
- Live headers: HTTPS 200 pages, CSP with `frame-ancestors 'none'`, HSTS,
  `nosniff`, DENY framing, strict-origin referrer policy, and restrictive
  Permissions-Policy. The manifest is `application/manifest+json`; hashed JS
  is `max-age=31536000, immutable`; `sw.js` is no-store; an unknown path is a
  designed HTTP 404.
- The static product has no application server endpoint. For the documented
  Sociobot license verification endpoint, one cookie-preserving client received
  200 on requests 1–30, then 429 on 31–35 with `Retry-After: 3, 3, 2, 2, 2`.
  Observed allowance: **30 requests per window**. Checkout returned HTTP 303
  to the hosted Dodo checkout. There is no sign-in flow.

## Defects

No release-blocking, critical, high, medium, or low product defects found in
this verification.

## Follow-up

Run `./gradlew assembleDebug` on an Android-capable runner or device matrix to
exercise an actual document provider. Native source/static contract tests,
Capacitor sync, signed release checksum, package contents, and Android
configuration all pass here; the absent JDK prevents only this container's
local APK compilation.
