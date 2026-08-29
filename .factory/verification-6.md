# Independent verification 6 — Android Backup Receipt

## Result

**PASS**

Candidate `c4c63dfca16cf8fd9804851634af1f9aeebd1d88` satisfies the supplied brief and work-order acceptance contract. No release-blocking, critical, high, medium, or low product defect was reproduced.

- Tested URL: <https://android-backup-receipt.sociobot.in>
- Tested on: 2026-08-29 UTC
- Live build ID: `9f78de63fd40`
- Implementation commit represented by that build: `bec5c98a47ea2dd4c772649175eb543636cfe57a`
- Candidate relationship: the two commits from `bec5c98` through `c4c63df` change factory documentation/evidence only; no product source or production asset changes.
- Evidence: [verification-6](qa-evidence/verification-6/)

## Mandatory first checks

The repository was clean before checkout. The nominated commit was checked out directly, then installed with `npm ci` (149 packages, zero vulnerabilities).

### Claims gate

`.factory/claims.json` exists and contains 18 claims. Every listed command was run separately before the broader test suite. Every command selected one tagged claim test and passed. The machine-readable summary is [claim-results.tsv](qa-evidence/verification-6/claim-results.tsv).

| Claim | Exact command | Result |
| --- | --- | --- |
| `demo-sample-receipt` | `npm run test:claims -- --grep @claim:demo-sample-receipt` | PASS |
| `resume-reset` | `npm run test:claims -- --grep @claim:resume-reset` | PASS |
| `local-only-files` | `npm run test:claims -- --grep @claim:local-only-files` | PASS |
| `receipt-exports` | `npm run test:claims -- --grep @claim:receipt-exports` | PASS |
| `sha256-evidence` | `npm run test:claims -- --grep @claim:sha256-evidence` | PASS |
| `hash-boundary` | `npm run test:unit -- -t @claim:hash-boundary` | PASS |
| `comparison-manifest` | `npm run test:claims -- --grep @claim:comparison-manifest` | PASS |
| `multi-folder-receipt` | `npm run test:claims -- --grep @claim:multi-folder-receipt` | PASS |
| `saf-read-only` | `npm run test:unit -- -t @claim:saf-read-only` | PASS |
| `android-private-backup` | `npm run test:unit -- -t @claim:android-private-backup` | PASS |
| `android-updates` | `npm run test:unit -- -t @claim:android-updates` | PASS |
| `local-metadata-storage` | `npm run test:claims -- --grep @claim:local-metadata-storage` | PASS |
| `migration-archive` | `npm run test:claims -- --grep @claim:migration-archive` | PASS |
| `license-revocation` | `npm run test:claims -- --grep @claim:license-revocation` | PASS |
| `print-view` | `npm run test:claims -- --grep @claim:print-view` | PASS |
| `responsive-keyboard` | `npm run test:claims -- --grep @claim:responsive-keyboard` | PASS |
| `offline-reload` | `npm run test:claims -- --grep @claim:offline-reload` | PASS |
| `offline-exports` | `npm run test:claims -- --grep @claim:offline-exports` | PASS |

Landing, legal, and README claims were cross-checked against this inventory. No unlisted material product claim was found.

### Cold first-read gate

Fresh Chromium context, 1440×900, no saved state:

- What it does: **“Check an Android backup before you wipe.”**
- For whom: **“For Android owners moving phones…”**
- First action: **“Try it with sample data.”**
- The primary action is visible without scrolling and opens `/demo` in one click.
- The first demo screen already shows a four-file receipt: 50% coverage, 2 matched, 1 missing, and 1 changed, with both downloads visible at 390×844.

This mandatory gate passes. See [live-report.json](qa-evidence/verification-6/live-report.json), [home-desktop-cold.png](qa-evidence/verification-6/home-desktop-cold.png), and [demo-mobile.png](qa-evidence/verification-6/demo-mobile.png).

## Build and automated gates

| Check | Result | Evidence |
| --- | --- | --- |
| `npm ci` | PASS | 149 packages; audit reported zero vulnerabilities |
| `npm test` | PASS | 16 Vitest tests and 19 Chromium tests; [log](qa-evidence/verification-6/npm-test.log) |
| `npm run lint` | PASS | TypeScript `tsc --noEmit`; [log](qa-evidence/verification-6/npm-lint.log) |
| `npm run build` | PASS | Exact production build created `dist/`; [log](qa-evidence/verification-6/npm-build.log) |
| `npm audit --omit=dev` | PASS | Zero vulnerabilities; [log](qa-evidence/verification-6/npm-audit.log) |
| `npx cap sync android` in a fresh temporary archive | PASS | [log](qa-evidence/verification-6/cap-sync.log) |
| Local `./gradlew assembleDebug` | NOT RUN | Worker has no `java`, `JAVA_HOME`, `ANDROID_HOME`, or `ANDROID_SDK_ROOT` |

The Gradle limitation is an environment coverage note, not a candidate defect. The public Android CI run for implementation commit `bec5c98` completed successfully. Its release and artifact identity were checked independently below.

## Deployment identity

The live and locally built files are byte-for-byte identical:

| File | SHA-256 |
| --- | --- |
| `index.html` | `a1379a9de980746fa9c624afa671881d0f2452e3d444dd93497fbc8da95b9313` |
| `assets/app-BCcZc5GW.js` | `8219fafc6a5e4ba4ecb1c1f1e3ea953fda562e83f3c0741000f35261c41138ea` |
| `assets/style-Ch_lQprv.css` | `57fab00379c21cbfb2573cfa31b177792cd8add0814b720d99321dae5dacb76f` |
| `sw.js` | `341b7d6a913cf805547b1e15ee581407ea54ff8d2550092ba723751e10daf338` |
| `manifest.webmanifest` | `0d01de479844a88428e0aa5a2f4aa9f6c2d9a41855650a12d0c2cc225bd5f10b` |

See [local checksums](qa-evidence/verification-6/local-build-sha256.txt) and [live checksums](qa-evidence/verification-6/live-build-sha256.txt). The footer exposes version `1.0.3` and build `9f78de63fd40`.

## End-to-end product behavior

Fresh live contexts exercised these cases:

- Sample: one click opened the isolated demo and showed the expected four-file receipt.
- Normal real input: three phone files versus three backup files produced 1 matched, 1 missing, 1 changed, 1 extra, and the “Do not wipe” conclusion.
- Multiple folder pairs: the full browser suite preserved pair rows and combined totals.
- Exact hash boundary: a 32 MiB file used full SHA-256; 32 MiB + 1 byte used disclosed sampled SHA-256.
- Empty source: unit coverage returned 0% without overstating coverage.
- Invalid input: malformed JSON and an unsupported manifest schema showed plain recovery guidance. A valid exported manifest recovered to 100% coverage.
- Resume and reset: active inventories survived reload; “Start another check” cleared the UI and IndexedDB state.
- Output: JSON receipt, CSV issue list, source manifest, and print flow worked.
- Storage boundary: demo and real data used separate IndexedDB/localStorage namespaces.
- Optional license: a live invalid token was removed from the URL, contacted only the Sociobot API, left the free receipt visible, and left export enabled. See [live-license-invalid.json](qa-evidence/verification-6/live-license-invalid.json).

## Accessibility and responsive behavior

- Desktop 1440×900 and mobile 390×844: no horizontal overflow.
- Keyboard: the skip link was first in the tab order, Enter moved focus to `<main>`, folder controls were keyboard-operable in the claim suite, and demo reset worked from the keyboard.
- Visible focus: 3 px solid `rgb(48, 73, 195)` outline with 4 px offset.
- Touch targets: all 25 visible interactive elements measured at least 44×44 CSS px on the mobile demo. See [touch-targets.json](qa-evidence/verification-6/touch-targets.json).
- Reduced motion: the media query matched and reduced transition/animation duration to `0.01ms`, with one iteration.
- Semantics: `lang=en`, route-specific title, one `<h1>`, one `<main>`, labelled buttons, and no missing image alt text.
- Axe: zero serious or critical findings on home, demo, privacy, terms, and the designed 404.
- `/opt/fleet/lib/verify-url.sh`: PASS with no console errors; [result](qa-evidence/verification-6/verify.json).
- Lighthouse accessibility: 100.

## Privacy, requests, and response policy

- The cold home and complete core demo flow made same-origin requests only. No analytics, remote fonts, third-party scripts, or unrelated services were observed.
- License verification made one disclosed cross-origin request to `https://api.sociobot.in/api/v1/products/android-backup-receipt/verify` after explicit license input.
- No sign-in exists, so the Microsoft Entra authority requirement is not applicable.
- No product-owned backend exists. The only server-side product call is the Sociobot license endpoint.
- Rate limit: in one recorded single-client burst, requests 1–30 returned 200; request 31 returned 429 with `Retry-After: 3` and `X-RateLimit-After: 3`. Observed allowance: 30 requests per burst. See [statuses](qa-evidence/verification-6/rate-limit-status.tsv) and [429 headers](qa-evidence/verification-6/rate-limit-429.headers).
- The primary response supplies CSP (including header-only `frame-ancestors 'none'`), HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and `X-Frame-Options: DENY`.
- HTML uses `max-age=30, must-revalidate`; fingerprinted assets use one-year immutable caching; `sw.js` is `no-cache, no-store, must-revalidate`.
- Every discovered non-checkout HTTP link returned 200 after redirects. The Sociobot checkout returned the expected 303 to hosted Dodo checkout; mail links were explicit. See [link-check.json](qa-evidence/verification-6/link-check.json).

## PWA and performance

- Manifest: standalone display, 192×192 and 512×512 icons, plus a 512×512 maskable icon.
- Service worker: active and controlling; explicit `registration.update()` completed against the no-store worker. Current cache/version is `backup-receipt-9f78de63fd40-shell`. No newer worker was available during the check. See [service-worker-update.json](qa-evidence/verification-6/service-worker-update.json).
- Offline: the service-worker-controlled demo reloaded with its receipt and downloaded JSON and CSV while offline.
- JavaScript: 32,802 B raw / 11.76 kB gzip (budget ≤ 200 KB).
- CSS: 18,503 B raw / 4.60 kB gzip (budget ≤ 50 KB).
- Mobile hero: 28,160 B (budget ≤ 300 KB).
- Lighthouse mobile: Performance 96, Accessibility 100, Best Practices 100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 230 ms, CLS 0, total transfer 61 KiB. See [summary](qa-evidence/verification-6/lighthouse-summary.json).
- Field INP is unavailable in a cold lab run. A transparent responsiveness proxy—trusted receipt clicks from handler start to next animation frame—measured median 9.5 ms and maximum 11.5 ms across ten runs. See [interaction-latency.json](qa-evidence/verification-6/interaction-latency.json).

## Android artifact

- Release `android-v1.0.3-build-9` is public, immutable, and not a prerelease.
- GitHub Actions run `33264739610` completed successfully for `bec5c98a47ea2dd4c772649175eb543636cfe57a`.
- Downloaded APK size: 16,483,683 B.
- Downloaded APK SHA-256: `706c53db9f1469382e2f94c5dd80711dba820096f5a6981556c4fc3ac9970308`, identical to `SHA256SUMS` and GitHub's artifact digest.
- ZIP integrity passed.
- The APK embeds the same `index.html`, JavaScript, CSS, and service worker hashes as the candidate/live build.
- Current signer certificate SHA-256: `A6:10:61:7B:7B:34:3A:B0:A6:18:03:A2:AD:B5:EF:EC:25:56:57:4B:04:71:09:3A:64:E3:A8:04:2B:8F:3B:01`; it matches release `android-v1.0.2-build-8`.
- Static tests confirm `ACTION_OPEN_DOCUMENT_TREE`, persisted read-only permission, `DocumentFile`, no broad storage permission, Android backup/transfer exclusions, protected signing inputs, increasing version codes, and immutable tags.

See [android-artifact.txt](qa-evidence/verification-6/android-artifact.txt) and [github-summary.json](qa-evidence/verification-6/github-summary.json).

## Defects by severity

- Release-blocking: none.
- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Coverage note

This worker did not include Java, an Android SDK, or an Android device/emulator, so it could not independently compile or interact with the native SAF picker. Native confidence comes from the passing source-level contract tests, successful fresh Capacitor sync, successful public Android build, published artifact integrity, embedded-candidate match, and stable signer match. This limitation does not change the PASS result.
