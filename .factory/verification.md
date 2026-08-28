# Independent product verification

## Verdict: FAIL

- Candidate: `83c9b945aa4db1c086300923909ce7e93601e162`
- Repository/branch: `B-Divyesh/sf-android-backup-receipt`, `main`
- Production URL: <https://android-backup-receipt.sociobot.in>
- Work order: `android-backup-receipt-verify-1`
- Verified: 2026-08-28 08:16–08:26 UTC

The web/PWA verifier is polished and its core comparison flow works, but the
candidate does not meet the acceptance contract. The required installable
Android/SAF product is not delivered, the advertised paid checkout is not
registered, and the billing verification endpoint has no observable required
rate limit.

## Defects

### Critical — C1: The required Android product is not delivered

The researched brief and artifact contract require an Android app using the
Storage Access Framework. The candidate ships a static website and only a
Capacitor wrapper skeleton:

- No `.apk` or `.aab` exists in the repository or on the product page.
- There is no APK download/link or checksum on the deployed page.
- `MainActivity.java` is an empty `BridgeActivity`; the Android manifest has
  only `INTERNET`; repository search found no `ACTION_OPEN_DOCUMENT_TREE`, SAF
  bridge, `DocumentFile`, activity-result implementation, or native filesystem
  plugin.
- The README and prior handoff explicitly defer the APK and native SAF bridge
  to a later work order.

The browser PWA can compare synthetic/desktop-selected directories, but that is
not fresh evidence that an installed Android artifact can acquire persistent
SAF tree permissions and perform the real phone-to-destination job. This misses
the smallest useful product and artifact class.

### High — H1: The advertised $7 checkout is broken

`GET https://api.sociobot.in/api/v1/products/android-backup-receipt/checkout`
returned HTTP `404` with:

```json
{"error":"enabled factory product","status":404}
```

The production UI actively advertises “Buy Migration Kit — $7”, so this is a
user-facing broken purchase path rather than a dormant integration.

### High — H2: Product verification endpoint is not rate limited as required

A rapid sequential burst of 80 requests to
`/api/v1/products/android-backup-receipt/verify` with unique invalid license
values returned `200` for all 80. No `429` response and no `Retry-After` header
were observed. Threshold observed: **greater than 80 requests**; the required
limiting threshold was not reached.

The ordinary invalid-license response itself was correct (`valid:false`,
`reason:"invalid"`, `cache-control:no-store`) and its CORS preflight allowed
the production origin.

### Medium — M1: Production response hardening is incomplete

The origin sends HSTS, `X-Content-Type-Options: nosniff`, and
`Referrer-Policy: strict-origin-when-cross-origin`, but it sends no Content
Security Policy, no `frame-ancestors`/`X-Frame-Options`, and no
`Permissions-Policy`. This matters for an application that handles private
filenames and license tokens in browser storage.

### Medium — M2: Several mobile navigation targets are under 44 px high

At a 390 × 844 viewport, the home/wordmark link measured 32 px high and the
Privacy, Terms, and Source footer links each measured 21 px high. This violates
the supplied 44 × 44 CSS-pixel touch-target baseline. The 1 × 1 file inputs are
intentionally wrapped by 48 px labels and were not counted as defects.

### Medium — M3: Static asset caching misses the supplied production policy

HTML, JavaScript, CSS, images, and the service worker all use
`cache-control: public, must-revalidate, max-age=30`; asset filenames are not
content-hashed and none receive long-lived immutable caching. Conditional
requests work (`If-None-Match` produced `304`) and Brotli is enabled, but the
required immutable strategy for fingerprinted static assets is absent.

### Low — L1: One axe moderate landmark violation remains

Axe reports `landmark-complementary-is-top-level` for the WebDAV/S3 `<aside>`
nested inside `<main>`. There were zero serious or critical axe findings on the
initial desktop page, populated receipt, 390 px page, privacy page, and terms
page.

### Low — L2: Manifest is served with a generic MIME type

`/manifest.webmanifest` is served as `application/octet-stream`, not
`application/manifest+json`. Chromium nevertheless parsed it with no manifest
or installability errors, so this is hardening/interoperability rather than a
current Chromium blocker.

## Clean-checkout gates

All commands were run from a new detached worktree at the candidate SHA.

| Check | Result |
| --- | --- |
| `npm ci` | PASS; 149 packages installed, 0 vulnerabilities |
| `npm test` | PASS; 7 Vitest unit tests and 3 Playwright tests |
| `npm run build` | PASS; includes `tsc --noEmit`; Vite 7.3.6 emitted `dist/` |
| Lint | Not available; repository defines no lint script/configuration |
| `npm audit --omit=dev` | PASS; 0 vulnerabilities |
| `npx cap sync android` | PASS |
| `android/gradlew assembleDebug` | BLOCKED after invocation; verifier image has no Java/JDK (`java: command not found`) |

The missing JDK is an environment limitation, not the basis for C1. C1 is based
on the absence of a distributable and of any native SAF implementation.

Production bundle sizes, raw before transfer compression:

- JavaScript: 16,259 bytes (budget ≤ 200 KB)
- CSS: 13,611 bytes (budget ≤ 50 KB)
- Mobile hero WebP: 28,160 bytes (budget ≤ 300 KB)
- Desktop hero WebP: 62,232 bytes
- Runtime fonts: none

## End-to-end product evidence

Automated independent checks ran against production at desktop 1440 × 900 and
mobile 390 × 844. Forty-one functional assertions passed with no page errors,
console errors, failed requests, or unexpected error responses.

- Normal discrepancy case: four source files against four destination files
  produced 2 accounted, 1 missing, 1 changed, 1 extra, 50% coverage, and the
  explicit “Do not wipe” conclusion.
- Success case: an imported destination manifest matching two source files
  produced 100% and the explicit all-files-accounted-for conclusion.
- Boundary hashing: exactly 32 MiB used full `sha256`; 32 MiB + 1 byte used
  `sampled-sha256`.
- Empty folder, cancelled scan, malformed JSON manifest, unsupported manifest
  schema, empty license input, and invalid returned license all produced usable
  recovery/status messages.
- Exported receipt JSON had schema `backup-receipt/result-1` and correct counts;
  exported CSV contained both discrepancy rows.
- Source/destination summaries survived reload; “Start another check” cleared
  them and returned focus to the source picker.
- The license return parameter was removed from the URL; an invalid license was
  rejected without blocking the free verifier.
- Keyboard traversal reached every visible interactive control without a trap;
  the skip link was first, worked with Enter, and every focused control had a
  solid blue focus treatment.
- There was no horizontal page overflow at desktop or 390 px. Reduced-motion
  emulation matched and reduced transitions to `0.01ms` with instant scrolling.
- Visual inspection of full-page desktop and 390 px screenshots found coherent
  responsive stacking and no overlap, clipping, or obscured core controls.

## Accessibility, privacy, and browser behavior

- Axe serious/critical findings: 0 on initial desktop, populated receipt,
  initial mobile, `/privacy/`, and `/terms/`.
- Lighthouse mobile, live: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; FCP 1.1 s, LCP 1.1 s, TBT 91 ms, CLS 0.
- Lighthouse mobile, local production preview: 95/100/100/100; FCP 1.0 s,
  LCP 1.25 s, TBT 252 ms, CLS 0.
- INP is a field metric and was not available from these Lighthouse lab runs;
  the live Total Blocking Time proxy was 91 ms.
- The page has a title, `lang="en"`, one `<h1>`, one `<main>`, meaningful image
  alt text, and visible focus states.
- Initial/core verification made requests only to the product origin. The only
  cross-origin request observed was the expected Sociobot license verification
  after explicit license input. No analytics, ad pixels, CDN fonts, or other
  third-party runtime scripts were observed; file hashing generated no upload.
- Privacy and terms pages load and accurately disclose IndexedDB/localStorage,
  filename/hash handling, billing verification, and the lack of EXIF parsing.

## PWA and deployment evidence

- Production `origin/main` resolved to the candidate SHA during verification.
- SHA-256 comparison of every generated `dist/` file against the corresponding
  live URL passed: **19/19 exact matches**. The deployed product therefore
  matches the candidate even though it exposes no explicit build-ID header.
- TLS validation passed. The live shell returned HTTP/2 `200`.
- Chromium reported no web-app-manifest or installability errors. The page was
  controlled by an activated service worker and held the
  `backup-receipt-v1-shell` cache.
- Offline mode displayed an explicit banner and a full app reload succeeded
  offline.
- A controlled local service-worker update simulation changed the shell from
  v1 to v2. `skipWaiting`/`clients.claim` activated v2, old cache removal left
  `backup-receipt-v2-shell`, and the in-app “A fresh offline version is ready”
  toast exposed its Reload action.

## Acceptance disposition

Do not promote this candidate as the Android product. Reverify after a real
SAF-capable APK/AAB is built and distributed, the production billing product is
registered, and the verification endpoint enforces a documented `429` +
`Retry-After` limit. The web/PWA core can be retained as supporting work.
