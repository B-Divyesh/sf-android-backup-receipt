# Independent verification 7 — Android Backup Receipt

## Verdict: **FAIL**

Tested candidate: `1c049834c8c283e55aa1440f562575701d02449c`  
Production URL: <https://android-backup-receipt.sociobot.in>  
Date: 2026-08-29 (UTC)

The previously reported deployment-only concern is **not present**. The live
`index.html`, `manifest.webmanifest`, and `sw.js` SHA-256 values match the
fresh candidate build exactly. The candidate nevertheless fails the claims
contract because one entry in `.factory/claims.json` invokes the wrong test
runner and exercises zero tests.

## Release-blocking finding

### High — V7-1: `resume-reset` has no runnable claim test at its declared command

`.factory/claims.json` declares this exact command:

```sh
npm run test:unit -- -t @claim:resume-reset
```

From the clean checkout it exited 0 but Vitest reported **2 files skipped / 16
tests skipped / 0 tests run**. The tagged test is actually a Playwright test in
`tests/e2e/app.spec.ts`; `npm run test:claims -- --grep @claim:resume-reset`
does run it and passed, but that is not the command declared for this claim.
The claims contract requires each declared command to assert the observable
claim, so this is not evidence for the published “resumes … / Start another
check clears it” promise.

Remediation: point `resume-reset.test` to
`npm run test:claims -- --grep @claim:resume-reset` (or move an equivalent
tagged test into the unit suite), then rerun every declared claim command from
a clean checkout.

## First read (cold production page)

It is an Android backup checker for people moving phones. It asks them to
compare selected phone and backup folders before wiping the old phone, then
issues a receipt showing which selected files match. The first action is the
visible, one-click **“Try it with sample data”** link; it opens `/demo` and
immediately displays a four-file receipt. This satisfies the plain-words and
demo-first-screen requirements.

## Claims gate (run first, after `npm ci`)

| Claim | Declared command result |
| --- | --- |
| `demo-sample-receipt` | PASS — 1 Playwright test |
| `demo-reset-isolation` | PASS — 1 Playwright test |
| `resume-reset` | **FAIL** — declared Vitest command selected 0 tests (16 skipped) |
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

The full suite independently passed: 16 Vitest tests and 21 Chromium tests.
The correctly targeted (but undeclared) Playwright `resume-reset` command also
passed, confirming the product behaviour but not repairing V7-1.

## Local build and end-to-end checks

- `npm ci`: PASS; 0 audit vulnerabilities.
- `npm test`: PASS (16 unit + 21 browser tests).
- `npm run lint`: PASS (`tsc --noEmit`).
- `npm run build`: PASS; produced `dist/`. Initial app JS is 33,491 bytes raw /
  11.90 kB gzip; CSS is 18,503 bytes raw / 4.60 kB gzip.
- The local production-preview browser suite covered a normal two-file
  comparison, changed/extra handling, persistence/reload, reset, multi-folder
  receipt, JSON/CSV export, print, sample reset, and manifest import.
  Independent live invalid-input checks returned: “That file is not a valid
  folder record. Choose one downloaded from this app.” and “That folder
  contained no readable files. Choose another folder.”
- A live selected-folder scan of two virtual files reported `DCIM / 2 files /
  6 B` and made only same-origin requests; no file content was uploaded.

## Live deployment, privacy, and platform checks

- Deployment parity: local and live `index.html` SHA-256
  `8f247628adda217645c07d5a13bbe4341283dfc2982f52f34e5168243dd02cbc`;
  manifest and service worker also matched. Live build ID is `4008a35e8d05`.
- Cold root request log contained only the product document, local JS/CSS, and
  local hero image. Live demo likewise made no cross-origin request before any
  optional license verification. CSP permits only `self` plus the disclosed
  Sociobot billing origin; HSTS, `nosniff`, `Referrer-Policy`,
  `frame-ancestors 'none'`, and a restrictive Permissions Policy are present.
- Fingerprinted JS/CSS use `public, max-age=31536000, immutable`; HTML uses a
  30-second revalidation policy. Unknown routes return the designed HTTP 404.
- `/demo` showed 2 accounted, 1 missing, 1 changed, 1 extra, and 50% coverage.
  After service-worker installation and `registration.update()`, an offline
  reload retained the demo receipt and showed the offline banner. Active cache:
  `backup-receipt-4008a35e8d05-shell`.
- Axe on live `/` at 1440×900 and `/demo` at 390×844: 0 serious/critical (and
  0 total) violations. Keyboard testing found the skip link first, a visible
  `rgb(48, 73, 195)` 3px focus ring, successful Skip-to-main, and Enter opened
  the folder chooser. No 390px horizontal overflow. Reduced motion reduced
  transition/animation durations to `0.00001s` and set scroll behaviour to
  `auto`.
- Mobile Lighthouse recorded Performance 97 and Accessibility 100, FCP 1.1 s,
  LCP 1.1 s, CLS 0, TBT 200 ms, and TTI 1.4 s. The installed Chromium target
  crashed during Lighthouse's final screenshot/BFCache collection, so those
  metrics are supplemental; independent Playwright and axe runs completed
  without console or page errors.
- Link crawl: all internal links returned 200; the APK and checksum redirects
  resolved; checkout correctly returned its hosted-checkout 303.
- The only server-side product endpoint is Sociobot license verification. A
  fresh cookie-preserving probe returned HTTP 200 for requests 1–30 and HTTP
  429 for 31–35, with `Retry-After` 3, 3, 3, 3, and 2 seconds. Observed
  allowance: 30 requests per window. There is no sign-in flow.

## Android artifact

The published `android-v1.0.3-build-11` APK downloaded successfully (16.48 MB)
and its SHA-256, `83aa18714ce7b77d1f38b0d05d0de768df20000e65f02539b7f3202ddc2e08c0`,
matches published `SHA256SUMS`. Its embedded `index.html` and `sw.js` match
this candidate build byte-for-byte. Native bridge/manifest unit claims passed.
`./gradlew assembleDebug` could not be run in this verifier container because
`java` is not installed; this is an environment limitation, not a candidate
finding.

## Next step

Fix V7-1 in `.factory/claims.json`, then repeat the clean declared-command
claims gate. No other release-blocking defect was found.
